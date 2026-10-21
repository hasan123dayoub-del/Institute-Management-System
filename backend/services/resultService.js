import AppError from "../lib/AppError.js";
import Result from "../Models/resultModel.js";
import Student from "../Models/studentModel.js";
import Teacher from "../Models/teacherModel.js";
import Class from "../Models/classModel.js";

export const RESULT_EXAMS = Object.freeze(["oral", "midterm", "final"]);

export const calculateStudentResult = ({ studentId, classId, levelId, levelCode, grades }) => {
  const latestGrades = new Map();
  for (const grade of grades) {
    if (!RESULT_EXAMS.includes(grade.exam)) continue;
    const existing = latestGrades.get(grade.exam);
    if (!existing || new Date(grade.graded_at || 0) >= new Date(existing.graded_at || 0)) {
      latestGrades.set(grade.exam, grade);
    }
  }
  const examScores = { oral: null, midterm: null, final: null };
  for (const exam of RESULT_EXAMS)
    examScores[exam] = latestGrades.get(exam)?.score ?? null;

  const missingExams = RESULT_EXAMS.filter((exam) => examScores[exam] === null);
  const totalScore = RESULT_EXAMS.reduce(
    (total, exam) => total + (examScores[exam] ?? 0),
    0,
  );

  return {
    student_id: studentId,
    class_id: classId,
    level_id: levelId,
    level_code: levelCode,
    exam_scores: examScores,
    missing_exams: missingExams,
    total_score: totalScore,
    max_score: 100,
    passed: totalScore >= 60,
    calculated_at: new Date(),
  };
};

export const result = async ({ classId, level, students, grades, session }) => {
  const gradesByStudent = new Map();
  for (const grade of grades) {
    const studentKey = String(grade.student_id);
    const studentGrades = gradesByStudent.get(studentKey) || [];
    studentGrades.push(grade);
    gradesByStudent.set(studentKey, studentGrades);
  }

  const outcomes = students.map((student) =>
    calculateStudentResult({
      studentId: student._id,
      classId,
      levelId: level._id,
      levelCode: level.code,
      grades: gradesByStudent.get(String(student._id)) || [],
    }),
  );
  if (outcomes.length) {
    await Result.bulkWrite(
      outcomes.map((outcome) => ({
        updateOne: {
          filter: { student_id: outcome.student_id, class_id: outcome.class_id },
          update: { $set: outcome },
          upsert: true,
        },
      })),
      { ordered: true, session },
    );
  }
  return outcomes;
};

export const getStudentResults = async (studentId, user) => {
  const student = await Student.findById(studentId).select("_id user_id");
  if (!student) throw new AppError(404, "Student not found", "NOT_FOUND");

  let classIds;
  if (user.role === "student") {
    if (!student.user_id.equals(user._id))
      throw new AppError(403, "You can only view your own results", "FORBIDDEN");
  } else if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ user_id: user._id }).select("_id");
    if (!teacher) throw new AppError(404, "Teacher profile not found", "NOT_FOUND");
    classIds = await Class.find({ teacher_id: teacher._id }).distinct("_id");
  } else if (!["admin", "secretary"].includes(user.role)) {
    throw new AppError(403, "Forbidden", "FORBIDDEN");
  }

  const filter = { student_id: student._id };
  if (classIds) filter.class_id = { $in: classIds };
  return Result.find(filter)
    .populate("level_id", "code")
    .populate({
      path: "class_id",
      select: "shift start_date status level_id",
      populate: { path: "level_id", select: "code" },
    })
    .sort({ createdAt: -1 });
};

import mongoose from "mongoose";
import Grade from "../Models/gradeModel.js";
import Class from "../Models/classModel.js";
import Student from "../Models/studentModel.js";
import Level from "../Models/levelModel.js";
import Schedule from "../Models/scheduleModel.js";
import AppError from "../lib/AppError.js";
import { endOfUtcDate, utcDateOnly } from "../lib/courseDates.js";
import { lastSessionDate } from "../lib/sessions.js";

export const MAX_SCORES = Object.freeze({ oral: 20, midterm: 30, final: 50 });
export const GRADING_GRACE_DAYS = 3;

const gradingDates = async (cls) => {
  if (!cls.start_date)
    throw new AppError(409, "Course start date is required", "COURSE_START_REQUIRED");
  const startDate = utcDateOnly(cls.start_date);
  const [level, schedules] = await Promise.all([
    Level.findById(cls.level_id),
    Schedule.find({ class_id: cls._id }),
  ]);
  if (!startDate)
    throw new AppError(409, "Course start date is invalid", "INVALID_COURSE_START");
  if (!level)
    throw new AppError(404, "Class level not found", "NOT_FOUND");
  const endDate = lastSessionDate({ ...cls.toObject(), level }, schedules);
  if (!endDate)
    throw new AppError(409, "A valid class schedule is required", "SCHEDULE_REQUIRED");
  const deadline = new Date(endDate);
  deadline.setUTCDate(deadline.getUTCDate() + GRADING_GRACE_DAYS);
  return { startDate, endDate, deadline: endOfUtcDate(deadline) };
};

const assertGradeWindow = (exam, { endDate, deadline }, now = new Date()) => {
  const today = utcDateOnly(now);
  if (exam === "final" && today < endDate)
    throw new AppError(403, "Final grades cannot be entered before the last session", "FORBIDDEN");
  if (now > deadline)
    throw new AppError(403, "Grading window has closed", "FORBIDDEN");
};

export const getClassGrades = async (classId) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
  const students = await Student.find({
    class_id: cls._id,
    status: "active",
  }).populate("user_id", "full_name email");
  const grades = await Grade.find({ class_id: cls._id }).sort({ student_id: 1, exam: 1 });
  const dates = await gradingDates(cls);
  return {
    students,
    grades,
    courseStartDate: dates.startDate,
    courseEndDate: dates.endDate,
    gradingDeadline: dates.deadline,
    classStatus: cls.status,
  };
};

export const recordClassGrades = async (classId, exam, grades) => {
  const maxScore = MAX_SCORES[exam];
  if (!maxScore) throw new AppError(400, "Invalid exam type", "BAD_REQUEST");
  if (!Array.isArray(grades) || grades.length === 0)
    throw new AppError(400, "At least one grade is required", "BAD_REQUEST");

  const cls = await Class.findById(classId);
  if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
  if (cls.status === "finished")
    throw new AppError(400, "Course is already finished", "BAD_REQUEST");
  const dates = await gradingDates(cls);
  assertGradeWindow(exam, dates);

  const studentIds = grades.map(({ student_id }) => student_id);
  if (new Set(studentIds.map(String)).size !== studentIds.length)
    throw new AppError(400, "A student can only appear once per request", "BAD_REQUEST");
  for (const { score } of grades) {
    if (!Number.isFinite(score) || score < 0 || score > maxScore)
      throw new AppError(400, `Scores for ${exam} must be between 0 and ${maxScore}`, "BAD_REQUEST");
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const classLock = await Class.updateOne(
        { _id: cls._id, status: { $ne: "finished" } },
        { $inc: { __v: 1 } },
        { session },
      );
      if (classLock.matchedCount !== 1)
        throw new AppError(400, "Course is already finished", "BAD_REQUEST");

      const studentLock = await Student.updateMany(
        {
          _id: { $in: studentIds },
          class_id: cls._id,
          status: "active",
        },
        { $inc: { __v: 1 } },
        { session },
      );
      if (studentLock.matchedCount !== studentIds.length)
        throw new AppError(400, "Every student must belong to this class", "BAD_REQUEST");

      const operations = grades.map(({ student_id, score }) => ({
        updateOne: {
          filter: { student_id, class_id: cls._id, exam },
          update: {
            $set: { score, max_score: maxScore, graded_at: new Date() },
            $setOnInsert: { student_id, class_id: cls._id, exam },
          },
          upsert: true,
        },
      }));
      await Grade.bulkWrite(operations, { ordered: true, session });
    });
  } finally {
    await session.endSession();
  }
  return Grade.find({ class_id: cls._id, exam }).sort({ student_id: 1 });
};

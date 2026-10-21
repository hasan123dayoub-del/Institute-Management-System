import Class from "../Models/classModel.js";
import { LEVEL_CODES } from "../Models/levelModel.js";
import Result from "../Models/resultModel.js";
import Student from "../Models/studentModel.js";
import Teacher from "../Models/teacherModel.js";

export const getOverviewStats = async () => {
  const [
    activeStudentsCount,
    waitingStudentsCount,
    runningClassesCount,
    salaryStats,
  ] = await Promise.all([
    Student.countDocuments({ status: "active" }),
    Student.countDocuments({ status: "waiting" }),
    Class.countDocuments({ status: "running" }),
    Teacher.aggregate([
      {
        $group: {
          _id: null,
          totalSalaries: { $sum: "$salary" },
          paidTeachers: {
            $sum: { $cond: [{ $eq: ["$salary_status", "paid"] }, 1, 0] },
          },
          totalTeachers: { $sum: 1 },
        },
      },
    ]),
  ]);
  const finance = salaryStats[0] ?? {
    totalSalaries: 0,
    paidTeachers: 0,
    totalTeachers: 0,
  };

  return {
    students: { active: activeStudentsCount, waiting: waitingStudentsCount },
    classes: { running: runningClassesCount },
    finance: {
      totalSalaries: finance.totalSalaries,
      paidTeachers: finance.paidTeachers,
      totalTeachers: finance.totalTeachers,
    },
  };
};

// Numbers for the dashboard charts. Institute sized data, so it is computed in memory from a few simple queries.
//   by_level: active students per level and shift      pass_by_level / pass_rate: from the saved results (null until a course has finished)
export const getBreakdown = async () => {
  const [students, classes, results] = await Promise.all([
    Student.find({ status: "active", class_id: { $ne: null } })
      .populate("level_id", "code")
      .populate("class_id", "shift"),
    Class.find().select("status"),
    Result.find().select("level_code passed"),
  ]);

  const by_level = LEVEL_CODES.map((level) => ({
    level,
    morning: students.filter((s) => s.level_id?.code === level && s.class_id?.shift === "morning").length,
    evening: students.filter((s) => s.level_id?.code === level && s.class_id?.shift === "evening").length,
  }));

  const rate = (list) => (list.length ? Math.round((list.filter((r) => r.passed).length / list.length) * 100) : null);
  return {
    pass_rate: rate(results),
    courses: {
      open: classes.filter((c) => c.status === "open").length,
      finished: classes.filter((c) => c.status === "finished").length,
    },
    by_level,
    pass_by_level: LEVEL_CODES.map((level) => ({ level, rate: rate(results.filter((r) => r.level_code === level)) })),
  };
};

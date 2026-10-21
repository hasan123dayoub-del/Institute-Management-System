import Class from "../Models/classModel.js";
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

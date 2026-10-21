import mongoose from "mongoose";
import Class from "../Models/classModel.js";
import Grade from "../Models/gradeModel.js";
import Level, { LEVEL_CODES } from "../Models/levelModel.js";
import Schedule from "../Models/scheduleModel.js";
import Student from "../Models/studentModel.js";
import { endOfUtcDate, utcDateOnly } from "../lib/courseDates.js";
import { lastSessionDate } from "../lib/sessions.js";
import { result } from "../services/resultService.js";

export const GRACE_DAYS = 3;
export const DAILY_RUN_HOUR_UTC = 1;

export const millisecondsUntilNextDailyRun = (now = new Date()) => {
  const nextRun = new Date(now);
  nextRun.setUTCHours(DAILY_RUN_HOUR_UTC, 0, 0, 0);
  if (nextRun <= now) nextRun.setUTCDate(nextRun.getUTCDate() + 1);
  return nextRun.getTime() - now.getTime();
};

export const isClassDue = (lastSession, today = new Date()) => {
  const finalSessionDate = utcDateOnly(lastSession);
  const currentDate = utcDateOnly(today);
  if (!finalSessionDate || !currentDate) return false;
  finalSessionDate.setUTCDate(finalSessionDate.getUTCDate() + GRACE_DAYS);
  const deadline = endOfUtcDate(finalSessionDate);
  return currentDate > deadline;
};

const finishClass = async (classId, now) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const cls = await Class.findOne({ _id: classId, status: "running" }).session(session);
      if (!cls) return false;

      const level = await Level.findById(cls.level_id).session(session);
      const schedules = await Schedule.find({ class_id: cls._id }).session(session);
      if (!level) throw new Error(`Level not found for class ${cls._id}`);
      const lastSession = lastSessionDate({ ...cls.toObject(), level }, schedules);
      if (!lastSession) {
        console.warn(`Skipping class ${cls._id}: no valid schedule is configured`);
        return false;
      }
      if (!isClassDue(lastSession, now)) return false;

      const students = await Student.find({ class_id: cls._id }).session(session);
      const allowedStatuses = Student.schema.path("status").enumValues;
      const invalidStudent = students.find(
        (student) => !allowedStatuses.includes(student.status),
      );
      if (invalidStudent) {
        throw new Error(
          `Student ${invalidStudent._id} has unsupported status "${invalidStudent.status}"; migrate legacy student statuses before finishing classes`,
        );
      }
      const studentsToFinalize = students.filter((student) => student.status !== "finished");
      const studentIds = studentsToFinalize.map((student) => student._id);
      const grades = studentIds.length
        ? await Grade.find({ class_id: cls._id, student_id: { $in: studentIds } })
            .select("student_id exam score graded_at")
            .session(session)
        : [];

      const nextCode = LEVEL_CODES[LEVEL_CODES.indexOf(level.code) + 1];
      const nextLevel = nextCode ? await Level.findOne({ code: nextCode }).session(session) : null;
      if (nextCode && !nextLevel)
        throw new Error(`Next level ${nextCode} is missing; cannot finish class ${cls._id}`);

      const studentResults = await result({
        classId: cls._id,
        level,
        students: studentsToFinalize,
        grades,
        session,
      });
      const resultsByStudent = new Map(
        studentResults.map((studentResult) => [String(studentResult.student_id), studentResult]),
      );

      for (const student of students) {
        if (student.status === "finished") {
          student.class_id = null;
          await student.save({ session });
          continue;
        }
        const studentResult = resultsByStudent.get(String(student._id));
        if (studentResult.passed && nextLevel) student.level_id = nextLevel._id;
        student.class_id = null;
        student.status = "finished";
        await student.save({ session });
      }

      cls.status = "finished";
      await cls.save({ session });
      return true;
    });
  } finally {
    await session.endSession();
  }
};

export async function finishClasses(now = new Date()) {
  const classes = await Class.find({ status: "running" }).select("_id");
  const finished = [];
  for (const cls of classes) {
    if (await finishClass(cls._id, now)) finished.push(cls._id);
  }
  return finished;
}

export const start = () => {
  let stopped = false;
  let timer;

  const scheduleNextRun = () => {
    if (stopped) return;
    timer = setTimeout(async () => {
      try {
        await finishClasses();
      } catch (error) {
        console.error("Class finishing job failed:", error);
      } finally {
        scheduleNextRun();
      }
    }, millisecondsUntilNextDailyRun());
  };

  const runOnStartup = async () => {
    try {
      await finishClasses();
    } catch (error) {
      console.error("Class finishing startup check failed:", error);
    } finally {
      scheduleNextRun();
    }
  };

  void runOnStartup();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
};

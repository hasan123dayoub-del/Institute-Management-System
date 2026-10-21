import Schedule from "../Models/scheduleModel.js";
import Class from "../Models/classModel.js";
import Teacher from "../Models/teacherModel.js";
import Level from "../Models/levelModel.js";
import AppError from "../lib/AppError.js";
import { lastSessionDate } from "../lib/sessions.js";

const getCourseEndDate = async (cls) => {
  const [level, schedules] = await Promise.all([
    Level.findById(cls.level_id),
    Schedule.find({ class_id: cls._id }),
  ]);
  if (!level) throw new AppError(404, "Class level not found", "NOT_FOUND");
  return lastSessionDate({ ...cls.toObject(), level }, schedules);
};
const findTeacher = async (userId) => {
  const teacher = await Teacher.findOne({ user_id: userId });
  if (!teacher) throw new AppError(404, "Teacher profile not found", "NOT_FOUND");
  return teacher;
};

const assertNoClash = async ({ teacherId, classId, scheduleId, day, start_time, end_time }) => {
  const classes = await Class.find({
    teacher_id: teacherId,
    status: { $ne: "finished" },
    _id: { $ne: classId },
  }).select("_id");
  const classIds = [...classes.map((cls) => cls._id), classId];
  const otherSchedules = await Schedule.find({
    class_id: { $in: classIds },
    day,
    ...(scheduleId && { _id: { $ne: scheduleId } }),
  }).select("start_time end_time");

  const clash = otherSchedules.some(
    (schedule) => start_time < schedule.end_time && end_time > schedule.start_time,
  );
  if (clash) throw new AppError(409, "Teacher has a timetable clash", "CONFLICT");
};

export const listSchedules = async (userId, classId) => {
  const teacher = await findTeacher(userId);
  if (classId) {
    const cls = await Class.findById(classId);
    if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
    if (!cls.teacher_id.equals(teacher._id))
      throw new AppError(403, "This is not your class", "FORBIDDEN");
  }
  const classes = await Class.find({ teacher_id: teacher._id }).select("_id");
  const classIds = classes.map((cls) => cls._id);
  const schedules = await Schedule.find({
    class_id: classId || { $in: classIds },
  })
    .populate({ path: "class_id", populate: { path: "level_id" } })
    .sort({ day: 1, start_time: 1 });
  const schedulesByClass = new Map();
  for (const schedule of schedules) {
    const key = String(schedule.class_id._id);
    const classSchedules = schedulesByClass.get(key) || [];
    classSchedules.push(schedule);
    schedulesByClass.set(key, classSchedules);
  }

  const courseEndDates = new Map();
  for (const [key, classSchedules] of schedulesByClass) {
    const cls = classSchedules[0].class_id;
    const endDate = lastSessionDate(
      { ...cls.toObject(), level: cls.level_id },
      classSchedules,
    );
    courseEndDates.set(key, endDate);
  }
  return schedules.map((schedule) => ({
    ...schedule.toObject(),
    courseEndDate: courseEndDates.get(String(schedule.class_id._id)) ?? null,
  }));
};

export const createSchedule = async (userId, { class_id, day, start_time, end_time }) => {
  const teacher = await findTeacher(userId);
  const cls = await Class.findById(class_id);
  if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
  if (!cls.teacher_id.equals(teacher._id))
    throw new AppError(403, "This is not your class", "FORBIDDEN");
  if (cls.status === "finished")
    throw new AppError(400, "Course is already finished", "BAD_REQUEST");

  await assertNoClash({
    teacherId: teacher._id,
    classId: cls._id,
    day,
    start_time,
    end_time,
  });
  const schedule = await Schedule.create({ class_id, day, start_time, end_time });
  return { schedule, courseEndDate: await getCourseEndDate(cls) };
};

export const modifySchedule = async (userId, scheduleId, { day, start_time, end_time }) => {
  const teacher = await findTeacher(userId);
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) throw new AppError(404, "Schedule not found", "NOT_FOUND");
  const cls = await Class.findById(schedule.class_id);
  if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
  if (!cls.teacher_id.equals(teacher._id))
    throw new AppError(403, "This is not your class", "FORBIDDEN");
  if (cls.status === "finished")
    throw new AppError(400, "Course is already finished", "BAD_REQUEST");

  await assertNoClash({
    teacherId: teacher._id,
    classId: cls._id,
    scheduleId: schedule._id,
    day,
    start_time,
    end_time,
  });
  schedule.day = day;
  schedule.start_time = start_time;
  schedule.end_time = end_time;
  await schedule.save();
  return { schedule, courseEndDate: await getCourseEndDate(cls) };
};

export const removeSchedule = async (userId, scheduleId) => {
  const teacher = await findTeacher(userId);
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) throw new AppError(404, "Schedule not found", "NOT_FOUND");
  const cls = await Class.findById(schedule.class_id);
  if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
  if (!cls.teacher_id.equals(teacher._id))
    throw new AppError(403, "This is not your class", "FORBIDDEN");
  if (cls.status === "finished")
    throw new AppError(400, "Course is already finished", "BAD_REQUEST");

  await schedule.deleteOne();
  return { courseEndDate: await getCourseEndDate(cls) };
};

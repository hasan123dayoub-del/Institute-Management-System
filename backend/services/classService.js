// P2
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
import AppError from "../lib/AppError.js";
import { lastSessionDate, sessionsHeld, totalSessions } from "../lib/sessions.js";
import { GRACE_DAYS } from "../jobs/finishClasses.js";
import Class from "../Models/classModel.js";
import Grade from "../Models/gradeModel.js";
import Level from "../Models/levelModel.js";
import Result from "../Models/resultModel.js";
import Schedule from "../Models/scheduleModel.js";
import Student from "../Models/studentModel.js";
import Teacher from "../Models/teacherModel.js";

const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null);
const addDays = (date, n) => {
  if (!date) return null;
  const moved = new Date(date);
  moved.setUTCDate(moved.getUTCDate() + n);
  return moved;
};

// The teacher profile of the logged in user, when that user is a teacher.
async function teacherProfile(user) {
  if (user.role !== "teacher") return null;
  const teacher = await Teacher.findOne({ user_id: user._id });
  if (!teacher) throw new AppError(404, "Teacher profile not found", "NOT_FOUND");
  return teacher;
}

// A teacher may only see their own classes.
function assertCanSee(cls, teacher) {
  if (teacher && !cls.teacher_id.equals(teacher._id))
    throw new AppError(403, "This is not your class", "FORBIDDEN");
}

// Builds what the client receives for a list of class documents (a few queries for all of them).
// Total sessions, sessions held and the dates are COMPUTED from the level hours and the timetable, never stored.
export async function viewsOf(classes) {
  if (classes.length === 0) return [];
  const ids = classes.map((c) => c._id);
  const [levels, teachers, schedules, counts] = await Promise.all([
    Level.find({ _id: { $in: classes.map((c) => c.level_id) } }),
    Teacher.find({ _id: { $in: classes.map((c) => c.teacher_id) } }).populate("user_id", "full_name"),
    Schedule.find({ class_id: { $in: ids } }).sort({ start_time: 1 }),
    Student.aggregate([
      { $match: { class_id: { $in: ids }, status: "active" } },
      { $group: { _id: "$class_id", count: { $sum: 1 } } },
    ]),
  ]);
  const levelById = new Map(levels.map((l) => [String(l._id), l]));
  const teacherById = new Map(teachers.map((t) => [String(t._id), t]));
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));
  const scheduleByClass = new Map();
  for (const s of schedules) {
    const key = String(s.class_id);
    if (!scheduleByClass.has(key)) scheduleByClass.set(key, []);
    scheduleByClass.get(key).push(s);
  }

  return classes.map((cls) => {
    const level = levelById.get(String(cls.level_id));
    const timetable = scheduleByClass.get(String(cls._id)) ?? [];
    const withLevel = { start_date: cls.start_date, level };
    const total = totalSessions(level);
    const last = lastSessionDate(withLevel, timetable);
    const held =
      cls.status === "open" ? 0 : cls.status === "finished" ? total : sessionsHeld(withLevel, timetable);
    return {
      id: cls._id,
      level: level?.code,
      shift: cls.shift,
      room: cls.room ?? "",
      capacity: cls.capacity,
      start_date: day(cls.start_date),
      status: cls.status,
      teacher: {
        id: cls.teacher_id,
        full_name: teacherById.get(String(cls.teacher_id))?.user_id?.full_name ?? "",
      },
      students_count: countById.get(String(cls._id)) ?? 0,
      total_sessions: total,
      sessions_done: held,
      last_session_date: day(last),
      closes_on: day(addDays(last, GRACE_DAYS)),
      schedule: timetable.map((s) => ({ id: s._id, day: s.day, start_time: s.start_time, end_time: s.end_time })),
    };
  });
}

export const viewOf = async (cls) => (await viewsOf([cls]))[0];

async function findClass(id) {
  const cls = await Class.findById(id);
  if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
  return cls;
}

export async function list(user, { status } = {}) {
  const teacher = await teacherProfile(user);
  const filter = {};
  if (status) filter.status = status;
  if (teacher) filter.teacher_id = teacher._id;
  return viewsOf(await Class.find(filter).sort({ start_date: -1 }));
}

export async function get(user, id) {
  const cls = await findClass(id);
  assertCanSee(cls, await teacherProfile(user));
  return viewOf(cls);
}

async function activeTeacher(teacherId) {
  const teacher = await Teacher.findById(teacherId).populate("user_id", "is_active");
  if (!teacher) throw new AppError(404, "Teacher not found", "NOT_FOUND");
  if (!teacher.user_id?.is_active)
    throw new AppError(409, "This teacher account is deactivated", "TEACHER_INACTIVE");
  return teacher;
}

export async function create({ level, shift, teacher_id, room, capacity, start_date }) {
  const levelDoc = await Level.findOne({ code: level });
  if (!levelDoc) throw new AppError(400, `Level ${level} does not exist. Run the seed first.`, "BAD_REQUEST");
  await activeTeacher(teacher_id);

  try {
    const cls = await Class.create({ level_id: levelDoc._id, teacher_id, shift, room, capacity, start_date });
    return viewOf(cls);
  } catch (err) {
    // UNIQUE(level, shift, start_date): one morning and one evening class per level per term
    if (err.code === 11000)
      throw new AppError(409, "A class for this level and shift already starts on that date", "DUPLICATE");
    throw err;
  }
}

export async function update(id, { teacher_id, room, capacity }) {
  const cls = await findClass(id);
  if (cls.status === "finished") throw new AppError(409, "A finished class cannot be changed", "FINISHED");

  if (capacity !== undefined) {
    const enrolled = await Student.countDocuments({ class_id: cls._id, status: "active" });
    if (capacity < enrolled) throw new AppError(409, `The class already has ${enrolled} students`, "CAPACITY");
    cls.capacity = capacity;
  }
  if (teacher_id !== undefined) {
    await activeTeacher(teacher_id);
    cls.teacher_id = teacher_id;
  }
  if (room !== undefined) cls.room = room;
  await cls.save();
  return viewOf(cls);
}

// One atomic update: only an "open" class can start, so two quick clicks cannot both succeed.
export async function start(id) {
  const cls = await Class.findOneAndUpdate({ _id: id, status: "open" }, { status: "running" }, { returnDocument: "after" });
  if (!cls) {
    await findClass(id); // 404 when it does not exist
    throw new AppError(409, "Only an open class can be started", "NOT_OPEN");
  }
  return viewOf(cls);
}

// Only an open class with nobody in it. Its timetable goes with it.
export async function remove(id) {
  const cls = await findClass(id);
  if (cls.status !== "open" || (await Student.exists({ class_id: cls._id })))
    throw new AppError(409, "Only an open class with no students can be deleted", "NOT_DELETABLE");
  await Schedule.deleteMany({ class_id: cls._id });
  await cls.deleteOne();
}

const toStudentRow = (student, user, level, grades, gradesCount) => ({
  id: student._id,
  user_id: user?._id,
  full_name: user?.full_name ?? "",
  phone: user?.phone ?? "",
  level: level?.code,
  status: student.status,
  grades,
  grades_count: gradesCount,
});

// The students of a class with their grades FOR THIS CLASS.
// While the course runs they are the class students. Once it is finished they have left the class,
// so the list comes from the saved results (what each of them scored there).
export async function students(user, id) {
  const cls = await findClass(id);
  assertCanSee(cls, await teacherProfile(user));

  let rows;
  let gradesOf;
  if (cls.status === "finished") {
    const results = await Result.find({ class_id: cls._id }).lean(); // plain objects: exam_scores is a sub-document
    rows = await Student.find({ _id: { $in: results.map((r) => r.student_id) } }).populate("user_id level_id");
    const byStudent = new Map(results.map((r) => [String(r.student_id), r.exam_scores]));
    gradesOf = (studentId) =>
      Object.fromEntries(Object.entries(byStudent.get(String(studentId)) ?? {}).filter(([, v]) => v !== null && v !== undefined));
  } else {
    rows = await Student.find({ class_id: cls._id, status: "active" }).populate("user_id level_id");
    const grades = await Grade.find({ class_id: cls._id });
    const byStudent = new Map();
    for (const g of grades) {
      const key = String(g.student_id);
      byStudent.set(key, { ...(byStudent.get(key) ?? {}), [g.exam]: g.score });
    }
    gradesOf = (studentId) => byStudent.get(String(studentId)) ?? {};
  }

  // grades_count counts every grade the student has anywhere: it decides if they can be deleted
  const counts = await Grade.aggregate([
    { $match: { student_id: { $in: rows.map((s) => s._id) } } },
    { $group: { _id: "$student_id", count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));

  return rows
    .map((s) => toStudentRow(s, s.user_id, s.level_id, gradesOf(s._id), countById.get(String(s._id)) ?? 0))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

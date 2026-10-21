// P2
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
import mongoose from "mongoose";
import AppError from "../lib/AppError.js";
import { hash } from "../lib/password.js";
import Class from "../Models/classModel.js";
import Grade from "../Models/gradeModel.js";
import Level from "../Models/levelModel.js";
import Student from "../Models/studentModel.js";
import User from "../Models/userModel.js";
import { viewOf as classViewOf } from "./classService.js";
import { assertEmailFree, assertPassword } from "./userService.js";

const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null);
const shiftName = (shift) => (shift === "morning" ? "Morning" : "Evening");

// What the client receives. `id` is the STUDENT id; `user_id` is needed for PATCH /users/:id/password.
// `class` is null while the student waits for a class. grades_count decides if the student can be deleted.
function toPublic(student, user, level, cls, clsLevel, gradesCount) {
  return {
    id: student._id,
    user_id: user._id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone ?? "",
    gender: student.gender ?? null,
    birth_date: day(student.birth_date),
    address: student.address ?? "",
    guardian_phone: student.guardian_phone ?? "",
    placement_score: student.placement_score ?? null,
    level: level.code,
    status: student.status,
    class: cls
      ? {
          id: cls._id,
          label: `${clsLevel.code} · ${shiftName(cls.shift)}`,
          level: clsLevel.code,
          shift: cls.shift,
          status: cls.status,
        }
      : null,
    grades_count: gradesCount,
  };
}

// Loads what toPublic needs for one student document.
async function viewOf(student) {
  const [user, level, cls, gradesCount] = await Promise.all([
    User.findById(student.user_id),
    Level.findById(student.level_id),
    student.class_id ? Class.findById(student.class_id) : null,
    Grade.countDocuments({ student_id: student._id }),
  ]);
  const clsLevel = cls ? await Level.findById(cls.level_id) : null;
  return toPublic(student, user, level, cls, clsLevel, gradesCount);
}

async function findStudent(id) {
  const student = await Student.findById(id);
  if (!student) throw new AppError(404, "Student not found", "NOT_FOUND");
  return student;
}

export async function list({ status, level, shift } = {}) {
  const filter = {};
  if (status) filter.status = status;
  const students = await Student.find(filter).populate("user_id").populate("level_id").populate({ path: "class_id", populate: { path: "level_id" } });

  const counts = await Grade.aggregate([{ $group: { _id: "$student_id", count: { $sum: 1 } } }]);
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));

  return students
    .filter((s) => s.user_id && s.level_id)
    .filter((s) => !level || s.level_id.code === level)
    .filter((s) => !shift || s.class_id?.shift === shift)
    .map((s) => toPublic(s, s.user_id, s.level_id, s.class_id, s.class_id?.level_id, countById.get(String(s._id)) ?? 0))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

// Seats are counted from the active students of the class.
async function assertSeat(cls, session) {
  const taken = await Student.countDocuments({ class_id: cls._id, status: "active" }).session(session ?? null);
  if (taken >= cls.capacity) throw new AppError(409, "This class is full", "CLASS_FULL");
}

// The account and the student are created together or not at all.
export async function create(data) {
  const { full_name, email, phone, password, level, class_id } = data;
  assertPassword(password);
  await assertEmailFree(email);
  const levelDoc = await Level.findOne({ code: level });
  if (!levelDoc) throw new AppError(400, `Level ${level} does not exist`, "BAD_REQUEST");

  let cls = null;
  if (class_id) {
    cls = await Class.findById(class_id);
    if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
    if (!cls.level_id.equals(levelDoc._id)) throw new AppError(400, "The class is at a different level", "LEVEL_MISMATCH");
    if (cls.status === "finished") throw new AppError(409, "This class is finished", "FINISHED");
  }
  const password_hash = await hash(password);

  const student = await mongoose.connection.transaction(async (session) => {
    if (cls) await assertSeat(cls, session);
    const [user] = await User.create([{ full_name, email, phone, password_hash, role: "student" }], { session });
    const [created] = await Student.create(
      [
        {
          user_id: user._id,
          level_id: levelDoc._id,
          class_id: cls?._id ?? null,
          status: cls ? "active" : "waiting",
          birth_date: data.birth_date,
          gender: data.gender,
          address: data.address,
          guardian_phone: data.guardian_phone,
          placement_score: data.placement_score,
        },
      ],
      { session },
    );
    return created;
  });
  return viewOf(student);
}

// Personal details. Withdrawing is allowed here too: the student leaves the class and can no longer log in.
export async function update(id, data) {
  const student = await findStudent(id);
  const user = await User.findById(student.user_id);

  if (data.full_name !== undefined) user.full_name = data.full_name;
  if (data.phone !== undefined) user.phone = data.phone;
  for (const field of ["gender", "birth_date", "address", "guardian_phone", "placement_score"]) {
    if (data[field] !== undefined && data[field] !== "") student[field] = data[field];
  }
  if (data.status === "withdrawn") {
    student.status = "withdrawn";
    student.class_id = null;
    user.is_active = false;
  }

  await mongoose.connection.transaction(async (session) => {
    await user.save({ session });
    await student.save({ session });
  });
  return viewOf(student);
}

// Put a waiting student in a class, or move a student to another class of the SAME level.
// Their grades follow them, so the whole change is one transaction.
export async function move(id, classId) {
  const student = await findStudent(id);
  const cls = await Class.findById(classId);
  if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
  if (!["waiting", "active"].includes(student.status))
    throw new AppError(409, "This student cannot be placed in a class", "NOT_PLACEABLE");
  if (!cls.level_id.equals(student.level_id))
    throw new AppError(400, "The class must be at the same level as the student", "LEVEL_MISMATCH");
  if (cls.status === "finished") throw new AppError(409, "This class is finished", "FINISHED");
  if (student.class_id?.equals(cls._id)) return viewOf(student);

  await mongoose.connection.transaction(async (session) => {
    await assertSeat(cls, session);
    if (student.class_id) {
      await Grade.updateMany({ student_id: student._id, class_id: student.class_id }, { class_id: cls._id }, { session });
    }
    student.class_id = cls._id;
    student.status = "active";
    await student.save({ session });
  });
  return viewOf(student);
}

// A student with grades is kept for the records: withdraw them instead.
export async function remove(id) {
  const student = await findStudent(id);
  if ((await Grade.countDocuments({ student_id: student._id })) > 0)
    throw new AppError(409, "This student has grades and cannot be deleted. Withdraw them instead.", "HAS_GRADES");

  await mongoose.connection.transaction(async (session) => {
    await Student.deleteOne({ _id: student._id }, { session });
    await User.deleteOne({ _id: student.user_id }, { session });
  });
}

// The student portal: the student, their class (with the teacher and the timetable) and the grades of that class.
export async function me(user) {
  const student = await Student.findOne({ user_id: user._id });
  if (!student) throw new AppError(404, "Student profile not found", "NOT_FOUND");
  const view = await viewOf(student);

  let cls = null;
  let grades = {};
  if (student.class_id) {
    const full = await classViewOf(await Class.findById(student.class_id));
    cls = {
      id: full.id,
      level: full.level,
      shift: full.shift,
      room: full.room,
      teacher_name: full.teacher.full_name,
      schedule: full.schedule,
      start_date: full.start_date,
      sessions_done: full.sessions_done,
      total_sessions: full.total_sessions,
      course_end_date: full.last_session_date,
    };
    for (const g of await Grade.find({ student_id: student._id, class_id: student.class_id })) grades[g.exam] = g.score;
  }
  return { ...view, class: cls, grades };
}

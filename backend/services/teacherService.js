// P1
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
import mongoose from "mongoose";
import AppError from "../lib/AppError.js";
import { hash } from "../lib/password.js";
import User from "../Models/userModel.js";
import Teacher from "../Models/teacherModel.js";
import Class from "../Models/classModel.js";
import { assertPassword, assertEmailFree } from "./userService.js";

// What the client receives. `id` is the TEACHER id (used by /teachers/:id and classes.teacher_id);
// `user_id` is needed for PATCH /users/:id/password.
const toPublic = (teacher, user, classes = []) => ({
  id: teacher._id,
  user_id: user._id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  is_active: user.is_active,
  qualification: teacher.qualification,
  hire_date: teacher.hire_date,
  salary: teacher.salary,
  salary_status: teacher.salary_status,
  classes: classes.map((c) => ({
    id: c._id,
    level: c.level_id?.code,
    shift: c.shift,
    status: c.status,
    start_date: c.start_date,
  })),
});

const classesOf = (teacherIds) =>
  Class.find({ teacher_id: { $in: teacherIds } })
    .populate("level_id", "code")
    .sort({ start_date: -1 });

// Builds the full view for a single teacher document.
async function viewOf(teacher) {
  const [user, classes] = await Promise.all([
    User.findById(teacher.user_id),
    classesOf([teacher._id]),
  ]);
  return toPublic(teacher, user, classes);
}

export async function list() {
  const teachers = await Teacher.find().populate("user_id");
  const classes = await classesOf(teachers.map((t) => t._id));

  const byTeacher = new Map();
  for (const c of classes) {
    const key = String(c.teacher_id);
    if (!byTeacher.has(key)) byTeacher.set(key, []);
    byTeacher.get(key).push(c);
  }

  return teachers
    .filter((t) => t.user_id) // skip a teacher whose user row is missing
    .map((t) => toPublic(t, t.user_id, byTeacher.get(String(t._id))))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

// user + teacher are created together or not at all.
export async function create(data) {
  const { full_name, email, phone, password, qualification, hire_date, salary } =
    data;
  assertPassword(password);
  await assertEmailFree(email);
  const password_hash = await hash(password);

  const { user, teacher } = await mongoose.connection.transaction(
    async (session) => {
      const [user] = await User.create(
        [{ full_name, email, phone, password_hash, role: "teacher" }],
        { session },
      );
      const [teacher] = await Teacher.create(
        [{ user_id: user._id, qualification, hire_date, salary }],
        { session },
      );
      return { user, teacher };
    },
  );

  return toPublic(teacher, user);
}

// Edits account fields (users) and job fields (teachers) in one transaction.
// Password and role are not editable here.
export async function update(id, data) {
  const teacher = await Teacher.findById(id);
  if (!teacher) throw new AppError(404, "Teacher not found", "NOT_FOUND");
  const user = await User.findById(teacher.user_id);
  if (!user) throw new AppError(404, "Teacher account not found", "NOT_FOUND");

  const { full_name, email, phone, is_active } = data;
  const { qualification, hire_date, salary } = data;

  if (email !== undefined && email !== user.email)
    await assertEmailFree(email, user._id);

  if (full_name !== undefined) user.full_name = full_name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (is_active !== undefined) user.is_active = is_active;
  if (qualification !== undefined) teacher.qualification = qualification;
  if (hire_date !== undefined) teacher.hire_date = hire_date;
  if (salary !== undefined) teacher.salary = salary;

  await mongoose.connection.transaction(async (session) => {
    await user.save({ session });
    await teacher.save({ session });
  });

  return viewOf(teacher);
}

// One atomic update: only an "unpaid" teacher can become "paid", so two quick
// clicks can never both succeed. The job on the 1st of the month resets everyone.
export async function pay(id) {
  const teacher = await Teacher.findOneAndUpdate(
    { _id: id, salary_status: "unpaid" },
    { salary_status: "paid" },
    { returnDocument: "after" },
  );

  if (!teacher) {
    if (!(await Teacher.exists({ _id: id })))
      throw new AppError(404, "Teacher not found", "NOT_FOUND");
    throw new AppError(
      409,
      "This month's salary is already paid",
      "ALREADY_PAID",
    );
  }

  return viewOf(teacher);
}

// npm run seed:demo
// Fills the database with a realistic institute so every screen has something to show:
// a secretary, 4 teachers, 12 classes (six levels x morning/evening) with timetables, ~150 students with grades,
// and one course that has already finished (closed by the real finishClasses job, so its results are real).
// Run `npm run seed` first (levels and admin). Safe to run once; use `npm run seed:demo -- --reset` to start over.
import "dotenv/config"; // must stay the first import
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { finishClasses } from "./jobs/finishClasses.js";
import { hash } from "./lib/password.js";
import Class from "./Models/classModel.js";
import Grade from "./Models/gradeModel.js";
import Level from "./Models/levelModel.js";
import Result from "./Models/resultModel.js";
import Schedule from "./Models/scheduleModel.js";
import Student from "./Models/studentModel.js";
import Teacher from "./Models/teacherModel.js";
import User from "./Models/userModel.js";

const PASSWORD = "Demo12345";
const MAX = { oral: 20, midterm: 30, final: 50 };
const JS_DAY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, sat: 6 };

const TEACHERS = [
  ["Lina Haddad", "lina@ascend.academy", "CELTA", 3200000, "paid"],
  ["Sami Issa", "sami@ascend.academy", "BA English", 2800000, "paid"],
  ["Rami Nasr", "rami@ascend.academy", "DELTA", 3000000, "unpaid"],
  ["Dana Issa", "dana@ascend.academy", "MA TESOL", 2900000, "unpaid"],
];
const MORNING = { A1: "08:30", A2: "10:00", B1: "11:30", B2: "08:30", C1: "10:00", C2: "11:30" };
const EVENING = { A1: "15:00", A2: "16:30", B1: "18:30", B2: "15:00", C1: "16:30", C2: "18:30" };
// level, shift, teacher, status, sessions held so far, days since the last session, students, starts in (days)
const PLAN = [
  ["A1", "morning", 0, "running", 20, 0, 14],
  ["A1", "evening", 0, "running", 24, 9, 12], // its last session was 9 days ago: the job below finishes it
  ["A2", "morning", 1, "running", 15, 0, 14],
  ["A2", "evening", 1, "running", 15, 0, 16],
  ["B1", "morning", 2, "running", 9, 0, 12],
  ["B1", "evening", 2, "running", 18, 0, 16],
  ["B2", "morning", 3, "running", 30, 1, 9],
  ["B2", "evening", 3, "running", 20, 0, 15],
  ["C1", "morning", 0, "running", 36, 1, 6], // last session was yesterday: the final exam can be entered now
  ["C1", "evening", 0, "running", 12, 0, 11],
  ["C2", "morning", 1, "open", 0, 0, 0, 10],
  ["C2", "evening", 1, "open", 0, 0, 0, 11],
];
const FIRST = ["Layan", "Karim", "Rami", "Taim", "Nour", "Maya", "Omar", "Sara", "Basel", "Fadi", "Joud", "Haya", "Yousef", "Noor", "Hiba", "Ziad", "Rima", "Tarek", "Dina", "Samer", "Lama", "Adam", "Mona", "Hadi", "Rawan", "Ali", "Lina", "Majd", "Salma", "Ghaith"];
const LAST = ["Saeed", "Nasser", "Khoury", "Sallom", "Hamdan", "Khalil", "Al-Ahmad", "Youssef", "Hammoud", "Suleiman", "Haddad", "Mansour", "Qasem", "Abboud", "Darwish"];

// ---- small date helpers (calendar days in UTC) ----
const midnight = (d = new Date()) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
// The start date that puts `done` class days between the start and `ref`.
function startDateFor(done, days, ref) {
  let count = 0;
  for (let d = ref; ; d = addDays(d, -1)) if (days.has(d.getUTCDay()) && ++count === done) return d;
}
const addMinutes = (time, minutes) => {
  const total = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

let seed = 7; // fixed seed: the same "random" grades every time
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const score = (exam, ratio) => Math.round(MAX[exam] * ratio);

try {
  await connectDB();
  const reset = process.argv.includes("--reset");

  if (reset) {
    console.log("--reset: removing classes, students, teachers, grades, results and their accounts...");
    await Promise.all([Class, Student, Teacher, Grade, Result, Schedule].map((model) => model.deleteMany({})));
    await User.deleteMany({ role: { $in: ["secretary", "teacher", "student"] } });
  } else if (await Class.exists({})) {
    console.log("The database already has classes, so nothing was changed. Use `npm run seed:demo -- --reset` to start over.");
    process.exit(0);
  }

  const levels = new Map((await Level.find()).map((l) => [l.code, l]));
  if (levels.size !== 6) throw new Error("Run `npm run seed` first: the six levels are missing.");
  const password_hash = await hash(PASSWORD);
  const today = midnight();
  const account = (full_name, email, role, extra = {}) => ({ full_name, email, password_hash, role, phone: `09${Math.floor(10000000 + rand() * 89999999)}`, ...extra });

  await User.create(account("Salma Darwish", "sec@ascend.academy", "secretary"));

  const teachers = [];
  for (const [name, email, qualification, salary, salary_status] of TEACHERS) {
    const user = await User.create(account(name, email, "teacher"));
    teachers.push(await Teacher.create({ user_id: user._id, qualification, hire_date: addDays(today, -400), salary, salary_status }));
  }

  let counter = 0;
  const makeStudent = async (extra) => {
    counter += 1;
    const name = `${FIRST[counter % FIRST.length]} ${LAST[(counter * 4 + Math.floor(counter / 30)) % LAST.length]}`;
    const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}${counter}@mail.com`;
    const { level, ...student } = extra;
    const user = await User.create(account(name, email, "student", { is_active: student.status !== "withdrawn" }));
    return Student.create({
      user_id: user._id,
      level_id: levels.get(level)._id,
      gender: counter % 2 ? "female" : "male",
      birth_date: new Date("2008-05-14"),
      address: "Damascus",
      guardian_phone: "0944 222 111",
      placement_score: 40 + (counter % 40),
      ...student,
    });
  };

  const classByIndex = [];
  for (const [i, [level, shift, teacherIndex, status, done, endedAgo, count, startsIn]] of PLAN.entries()) {
    const days = shift === "morning" ? ["sat", "mon", "wed"] : ["sun", "tue", "thu"];
    const time = (shift === "morning" ? MORNING : EVENING)[level];
    const start_date =
      status === "open" ? addDays(today, startsIn) : startDateFor(done, new Set(days.map((d) => JS_DAY[d])), addDays(today, -endedAgo));
    const cls = await Class.create({ level_id: levels.get(level)._id, teacher_id: teachers[teacherIndex]._id, shift, room: `R${(i % 4) + 1}`, capacity: 20, start_date, status });
    classByIndex.push(cls);
    await Schedule.insertMany(days.map((day) => ({ class_id: cls._id, day, start_time: time, end_time: addMinutes(time, 90) })));

    const total = Math.round((level.startsWith("A") ? 36 : level.startsWith("B") ? 45 : 54) / 1.5);
    const progress = done / total;
    const finishing = endedAgo >= 4; // this course ends for real below, so it gets all three grades
    for (let k = 0; k < count; k++) {
      const student = await makeStudent({ level, class_id: cls._id, status: "active" });
      const noGradesYet = !finishing && done > 0 && k === count - 1; // the newest student: can still be deleted
      const failing = finishing && k < 3;
      const ratio = () => 0.5 + 0.45 * (failing ? rand() * 0.1 : 0.45 + 0.5 * rand());
      const grades = [];
      if (!noGradesYet) {
        if (progress >= 0.4) grades.push(["oral", score("oral", ratio())]);
        if (progress >= 0.55) grades.push(["midterm", score("midterm", ratio())]);
        if (finishing) grades.push(["final", score("final", ratio())]);
      }
      if (grades.length) {
        await Grade.insertMany(grades.map(([exam, value]) => ({ student_id: student._id, class_id: cls._id, exam, score: value, max_score: MAX[exam] })));
      }
    }
  }

  // Students in other situations.
  for (const level of ["A1", "A1", "A1", "A2", "A2"]) await makeStudent({ level, status: "waiting" });
  for (let i = 0; i < 2; i++) await makeStudent({ level: "C2", status: "graduated" });
  const withdrawn = await makeStudent({ level: "B2", status: "withdrawn" });
  await Grade.create({ student_id: withdrawn._id, class_id: classByIndex[7]._id, exam: "oral", score: 15, max_score: 20 }); // has a grade: it was withdrawn, not deleted
  await makeStudent({ level: "B2", status: "withdrawn" });

  // The student account used to try the student portal.
  const layan = await Student.findOne({ class_id: classByIndex[5]._id });
  await User.updateOne({ _id: layan.user_id }, { full_name: "Layan Saeed", email: "layan@mail.com", phone: "0944 123 456" });

  // Close the courses that are over, with the real job: results are saved and the students move on.
  const finished = await finishClasses();
  console.log(`Seed demo done. The course closing job finished ${finished.length} class(es).`);
  console.log(`\nDemo logins (password for all: ${PASSWORD}):`);
  console.log("  admin      the one from `npm run seed` (see backend/.env)");
  console.log("  secretary  sec@ascend.academy");
  console.log("  teacher    lina@ascend.academy  (also sami@, rami@, dana@)");
  console.log("  student    layan@mail.com");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

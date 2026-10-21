import "dotenv/config"; // must stay the first import
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Class from "./Models/classModel.js";
import Grade from "./Models/gradeModel.js";
import Level from "./Models/levelModel.js";
import Result from "./Models/resultModel.js";
import Schedule from "./Models/scheduleModel.js";
import Student from "./Models/studentModel.js";
import Teacher from "./Models/teacherModel.js";
import User from "./Models/userModel.js";
import { hash } from "./lib/password.js";

const HOURS = { A1: 36, A2: 36, B1: 45, B2: 45, C1: 54, C2: 54 };

try {
  await connectDB();

  // Create every collection with its indexes (unique email, one class per level+shift+date, one grade per exam...)
  // even while it is still empty, so the whole schema is there from the first day.
  for (const model of [User, Teacher, Level, Class, Student, Schedule, Grade, Result]) {
    await model.createCollection();
    await model.syncIndexes();
  }

  for (const [code, hours] of Object.entries(HOURS)) {
    await Level.updateOne({ code }, { code, hours }, { upsert: true });
  }

  const email = (process.env.ADMIN_EMAIL || "admin@ascend.academy").toLowerCase();
  if (!(await User.exists({ email }))) {
    await User.create({
      full_name: process.env.ADMIN_NAME || "Admin",
      email,
      password_hash: await hash(process.env.ADMIN_PASSWORD || "change-me-123"),
      role: "admin",
    });
  }

  // TODO (all): sample secretary, teachers, classes, students with grades.
  console.log("Seed done");
  await mongoose.disconnect();
} catch (err) {
  console.error(err);
  process.exit(1);
}

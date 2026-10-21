import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Class from "../Models/classModel.js";
import Grade from "../Models/gradeModel.js";
import Schedule from "../Models/scheduleModel.js";
import Student from "../Models/studentModel.js";

test("schedule rejects an end time that is not after its start time", async () => {
  const schedule = new Schedule({
    class_id: new mongoose.Types.ObjectId(),
    day: "mon",
    start_time: "10:30",
    end_time: "10:30",
  });

  await assert.rejects(schedule.validate(), /end_time must be after start_time/);
});

test("class end date is computed and is not stored in the class document", async () => {
  const cls = new Class({
    level_id: new mongoose.Types.ObjectId(),
    teacher_id: new mongoose.Types.ObjectId(),
    shift: "morning",
    start_date: "2026-01-10",
    end_date: "2026-01-09",
  });
  await assert.doesNotReject(cls.validate());
  assert.equal(Class.schema.path("end_date"), undefined);
  assert.equal(cls.toObject().end_date, undefined);
});

test("student status is waiting, active, withdrawn or graduated", async () => {
  const student = new Student({
    user_id: new mongoose.Types.ObjectId(),
    level_id: new mongoose.Types.ObjectId(),
    status: "graduated",
  });
  await assert.doesNotReject(student.validate());

  student.status = "finished";
  await assert.rejects(student.validate(), /`finished` is not a valid enum value/);
});

test("grade model enforces the configured maximum score per exam", async () => {
  const grade = new Grade({
    student_id: new mongoose.Types.ObjectId(),
    class_id: new mongoose.Types.ObjectId(),
    exam: "oral",
    score: 18,
    max_score: 20,
  });
  await assert.doesNotReject(grade.validate());

  grade.max_score = 30;
  await assert.rejects(grade.validate(), /max_score must be 20 for oral/);
});

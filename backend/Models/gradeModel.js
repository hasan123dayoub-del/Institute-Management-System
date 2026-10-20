const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  exam: {
    type: String,
    enum: ["oral", "midterm", "final"],
    required: true,
  },
  score: { type: Number, required: true },
  max_score: { type: Number, required: true },
  graded_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Grade", gradeSchema);

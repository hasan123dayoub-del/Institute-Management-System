import mongoose from "mongoose";

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
  score: { type: Number, required: true, min: 0 },
  max_score: { type: Number, required: true, min: 1 },
  graded_at: { type: Date, default: Date.now },
});

gradeSchema.pre("validate", function () {
  if (this.score > this.max_score) {
    this.invalidate("score", "score cannot exceed max_score");
  }
});

// One grade per student per exam per class.
gradeSchema.index({ student_id: 1, class_id: 1, exam: 1 }, { unique: true });

export default mongoose.model("Grade", gradeSchema);

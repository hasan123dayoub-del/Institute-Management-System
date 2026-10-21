import mongoose from "mongoose";

const examScoresSchema = new mongoose.Schema(
  {
    oral: { type: Number, min: 0, max: 20, default: null },
    midterm: { type: Number, min: 0, max: 30, default: null },
    final: { type: Number, min: 0, max: 50, default: null },
  },
  { _id: false },
);

const resultSchema = new mongoose.Schema(
  {
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
    level_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    level_code: { type: String, required: true },
    exam_scores: { type: examScoresSchema, required: true },
    missing_exams: {
      type: [{ type: String, enum: ["oral", "midterm", "final"] }],
      default: [],
    },
    total_score: { type: Number, required: true, min: 0, max: 100 },
    max_score: { type: Number, required: true, default: 100, min: 100, max: 100 },
    passed: { type: Boolean, required: true },
    calculated_at: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

resultSchema.index({ student_id: 1, class_id: 1 }, { unique: true });
resultSchema.index({ student_id: 1, createdAt: -1 });

export default mongoose.model("Result", resultSchema);

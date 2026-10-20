import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  level_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true,
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  shift: {
    type: String,
    enum: ["morning", "evening"],
    required: true,
  },
  room: String,
  capacity: { type: Number, default: 20, min: 1 },
  start_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["open", "running", "finished"],
    default: "open",
  },
});

// One morning and one evening class per level per term.
classSchema.index({ level_id: 1, shift: 1, start_date: 1 }, { unique: true });

export default mongoose.model("Class", classSchema);

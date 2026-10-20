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
  capacity: { type: Number, required: true },
  start_date: Date,
  status: {
    type: String,
    enum: ["open", "running", "finished"],
    default: "open",
  },
});

module.exports = mongoose.model("Class", classSchema);

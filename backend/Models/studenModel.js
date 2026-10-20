const studentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  level_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true,
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null,
  },
  birth_date: Date,
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  address: String,
  guardian_phone: String,
  placement_score: Number,
  registered_at: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["waiting", "active", "withdrawn", "graduated"],
    default: "waiting",
  },
});

module.exports = mongoose.model("Student", studentSchema);

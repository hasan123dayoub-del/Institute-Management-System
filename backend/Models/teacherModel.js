const teacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  qualification: String,
  hire_date: Date,
  salary: Number,
  salary_status: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);

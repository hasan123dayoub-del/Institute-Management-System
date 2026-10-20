import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  qualification: String,
  hire_date: { type: Date, required: true },
  salary: { type: Number, required: true, min: 0 },
  salary_status: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },
});

export default mongoose.model("Teacher", teacherSchema);

import mongoose from "mongoose";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/; // "18:30"

const scheduleSchema = new mongoose.Schema({
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  day: {
    type: String,
    enum: ["sat", "sun", "mon", "tue", "wed", "thu"],
    required: true,
  },
  start_time: { type: String, required: true, match: TIME },
  end_time: { type: String, required: true, match: TIME },
});

scheduleSchema.pre("validate", function () {
  if (this.start_time && this.end_time && this.start_time >= this.end_time) {
    this.invalidate("end_time", "end_time must be after start_time");
  }
});

scheduleSchema.index({ class_id: 1 });

export default mongoose.model("Schedule", scheduleSchema);

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
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
});

module.exports = mongoose.model("Schedule", scheduleSchema);

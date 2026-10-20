const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  book: String,
  hours: { type: Number, required: true },
});

module.exports = mongoose.model("Level", levelSchema);

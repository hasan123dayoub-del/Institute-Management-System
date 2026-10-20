import mongoose from "mongoose";

// The enum order is the level order: A1 < A2 < ... < C2.
export const LEVEL_CODES = ["A1", "A2", "B1", "B2", "C1", "C2"];

const levelSchema = new mongoose.Schema({
  code: { type: String, enum: LEVEL_CODES, required: true, unique: true },
  book: String,
  hours: { type: Number, required: true, min: 1 }, // sessions = hours / 1.5
});

const Level = mongoose.model("Level", levelSchema);

export default Level;

// P2
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
import Level, { LEVEL_CODES } from "../Models/levelModel.js";

// [{ id, code: "A1", hours: 36 }, ...] in level order (A1 first)
export async function list() {
  const levels = await Level.find();
  return levels
    .sort((a, b) => LEVEL_CODES.indexOf(a.code) - LEVEL_CODES.indexOf(b.code))
    .map((level) => ({ id: level._id, code: level.code, hours: level.hours }));
}

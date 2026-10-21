// P1
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
import AppError from "../lib/AppError.js";
import { hash, CAN_SET, MIN_LENGTH } from "../lib/password.js";
import User from "../Models/userModel.js";

export function assertPassword(password) {
  if (typeof password !== "string" || password.length < MIN_LENGTH)
    throw new AppError(
      400,
      `Password must be at least ${MIN_LENGTH} characters`,
      "VALIDATION",
    );
}

export async function assertEmailFree(email, exceptUserId) {
  const filter = { email };
  if (exceptUserId) filter._id = { $ne: exceptUserId };
  if (await User.exists(filter))
    throw new AppError(409, "This email is already in use", "EMAIL_TAKEN");
}

export async function setPassword(actor, targetId, password) {
  const target = await User.findById(targetId);
  if (!target) throw new AppError(404, "User not found", "NOT_FOUND");

  const allowed = CAN_SET[actor.role] || [];
  if (!allowed.includes(target.role))
    throw new AppError(
      403,
      "You are not allowed to set this user's password",
      "FORBIDDEN",
    );

  assertPassword(password);
  await User.updateOne(
    { _id: target._id },
    { password_hash: await hash(password) },
  );
}

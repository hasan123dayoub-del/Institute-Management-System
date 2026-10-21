// P1
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
import AppError from "../lib/AppError.js";
import { hash } from "../lib/password.js";
import User from "../Models/userModel.js";
import { assertPassword, assertEmailFree } from "./userService.js";

const ROLE = "secretary";

// A secretary has no table of her own: her id IS the user id.
const toPublic = (u) => ({
  id: u._id,
  full_name: u.full_name,
  email: u.email,
  phone: u.phone,
  is_active: u.is_active,
  created_at: u.createdAt,
});

async function findSecretary(id) {
  const user = await User.findOne({ _id: id, role: ROLE });
  if (!user) throw new AppError(404, "Secretary not found", "NOT_FOUND");
  return user;
}

export async function list() {
  const users = await User.find({ role: ROLE }).sort({ full_name: 1 });
  return users.map(toPublic);
}

export async function create({ full_name, email, phone, password }) {
  assertPassword(password);
  await assertEmailFree(email);
  const user = await User.create({
    full_name,
    email,
    phone,
    role: ROLE,
    password_hash: await hash(password),
  });
  return toPublic(user);
}

// Only these fields can change here. Role and password never do (password has its own route).
export async function update(id, data) {
  const user = await findSecretary(id);
  const { full_name, email, phone, is_active } = data;

  if (email !== undefined && email !== user.email)
    await assertEmailFree(email, user._id);

  if (full_name !== undefined) user.full_name = full_name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (is_active !== undefined) user.is_active = is_active;

  await user.save();
  return toPublic(user);
}

export async function remove(id) {
  const user = await findSecretary(id);

  // Nobody else runs the daily operations, so the last active secretary stays.
  if (user.is_active) {
    const activeCount = await User.countDocuments({
      role: ROLE,
      is_active: true,
    });
    if (activeCount <= 1)
      throw new AppError(
        409,
        "You cannot delete the last active secretary",
        "LAST_SECRETARY",
      );
  }

  await user.deleteOne();
}

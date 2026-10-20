import AppError from "../lib/AppError.js";
import { sign } from "../lib/jwt.js";
import { compare } from "../lib/password.js";
import User from "../Models/userModel.js";

const publicUser = ({ _id, full_name, email, phone, role }) => ({
  id: _id,
  full_name,
  email,
  phone,
  role,
});

export async function login({ email, password }) {
  // password_hash is select:false, so it must be requested explicitly.
  const user = await User.findOne({ email }).select("+password_hash");
  const ok = user && (await compare(password, user.password_hash));
  if (!ok) throw new AppError(401, "Wrong email or password", "BAD_CREDENTIALS");
  if (!user.is_active)
    throw new AppError(403, "This account is deactivated", "INACTIVE");

  return { token: sign(user), user: publicUser(user) };
}

export const getProfile = (user) => publicUser(user);

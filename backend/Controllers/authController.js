import AppError from "../lib/AppError.js";
import { sign } from "../lib/jwt.js";
import { compare } from "../lib/password.js";
import User from "../Models/userModel.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  // password_hash is select:false, so it must be requested explicitly.
  const user = await User.findOne({ email }).select("+password_hash");
  const ok = user && (await compare(password, user.password_hash));
  if (!ok) throw new AppError(401, "Wrong email or password", "BAD_CREDENTIALS");
  if (!user.is_active)
    throw new AppError(403, "This account is deactivated", "INACTIVE");

  res.json({
    token: sign(user),
    user: {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  });
};

export const me = (req, res) => {
  const { _id, full_name, email, phone, role } = req.user;
  res.json({ id: _id, full_name, email, phone, role });
};

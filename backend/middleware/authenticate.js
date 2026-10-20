import AppError from "../lib/AppError.js";
import { verify } from "../lib/jwt.js";
import User from "../Models/userModel.js";

export default async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AppError(401, "Authentication required", "UNAUTHORIZED");

  const { id } = verify(token);
  const user = await User.findById(id);
  if (!user || !user.is_active)
    throw new AppError(401, "Account is not active", "UNAUTHORIZED");

  req.user = user;
  next();
};

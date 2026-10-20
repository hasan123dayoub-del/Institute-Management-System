import jwt from "jsonwebtoken";

export const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const verify = (token) => jwt.verify(token, process.env.JWT_SECRET);

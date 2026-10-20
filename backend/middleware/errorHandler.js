import { ZodError } from "zod";
import mongoose from "mongoose";

// Every error leaves as { message, code } so the client shows one kind of toast.
export default (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof ZodError) {
    const message = err.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    return res.status(400).json({ message, code: "VALIDATION" });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message, code: "VALIDATION" });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "Invalid id", code: "BAD_ID" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value", code: "DUPLICATE" });
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid token", code: "UNAUTHORIZED" });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message,
    code: err.code || (status === 500 ? "INTERNAL" : "ERROR"),
  });
};

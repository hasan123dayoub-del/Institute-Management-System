import AppError from "../lib/AppError.js";

// authorize("secretary", "admin"): must run after authenticate.
export default (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    throw new AppError(403, "Forbidden", "FORBIDDEN");
  next();
};

import AppError from "../lib/AppError.js";
import Teacher from "../Models/teacherModel.js";
import Class from "../Models/classModel.js";

// A teacher may only touch their own classes. Other roles pass through
// (authorize() decides whether they may reach the route at all).
// Reads the class id from req.params.classId or req.params.id.
export default async (req, res, next) => {
  if (req.user.role !== "teacher") return next();

  const classId = req.params.classId || req.params.id;
  const teacher = await Teacher.findOne({ user_id: req.user._id });
  const cls = await Class.findById(classId);
  if (!cls) throw new AppError(404, "Class not found", "NOT_FOUND");
  if (!teacher || !cls.teacher_id.equals(teacher._id))
    throw new AppError(403, "This is not your class", "FORBIDDEN");

  req.class = cls;
  next();
};

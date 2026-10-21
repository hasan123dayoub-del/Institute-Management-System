import AppError from "../lib/AppError.js";
import Teacher from "../Models/teacherModel.js";
import Class from "../Models/classModel.js";
import Schedule from "../Models/scheduleModel.js";

export default async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") return next();

    const teacher = await Teacher.findOne({ user_id: req.user._id });
    if (!teacher) return next(new AppError(404, "Teacher profile not found", "NOT_FOUND"));

    let classId = req.params.classId || req.body?.class_id;
    if (!classId && req.params.id) {
      const schedule = await Schedule.findById(req.params.id).select("class_id");
      if (!schedule) return next(new AppError(404, "Schedule not found", "NOT_FOUND"));
      classId = schedule.class_id;
    }
    if (!classId) return next(new AppError(400, "Class ID is required", "BAD_REQUEST"));

    const cls = await Class.findById(classId);
    if (!cls) return next(new AppError(404, "Class not found", "NOT_FOUND"));

    if (!cls.teacher_id.equals(teacher._id)) {
      return next(new AppError(403, "This is not your class", "FORBIDDEN"));
    }

    req.class = cls;
    return next();
  } catch (error) {
    return next(error);
  }
};

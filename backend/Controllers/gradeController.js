import { getClassGrades, recordClassGrades } from "../services/gradeService.js";

export const getGradesForClass = async (req, res, next) => {
  try {
    const result = await getClassGrades(req.params.classId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const enterGrades = async (req, res, next) => {
  try {
    const grades = await recordClassGrades(
      req.params.classId,
      req.body.exam,
      req.body.grades,
    );
    res.status(200).json({ message: "Grades recorded successfully", grades });
  } catch (error) {
    next(error);
  }
};

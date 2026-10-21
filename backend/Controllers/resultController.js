import { getStudentResults } from "../services/resultService.js";

export const getResultsForStudent = async (req, res, next) => {
  try {
    const results = await getStudentResults(req.params.studentId, req.user);
    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

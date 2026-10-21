import express from "express";
import { getResultsForStudent } from "../Controllers/resultController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.get(
  "/student/:studentId",
  authenticate,
  authorize("student", "teacher", "secretary", "admin"),
  getResultsForStudent,
);

export default router;

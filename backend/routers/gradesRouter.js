import express from 'express';
import { enterGrades, getGradesForClass } from '../Controllers/gradeController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import ownsClass from '../middleware/ownsClass.js';
import validate from "../middleware/validate.js";
import { z } from "zod";

const router = express.Router();
const gradesSchema = z.object({
  exam: z.enum(["oral", "midterm", "final"]),
  grades: z.array(
    z.object({
      student_id: z.string().regex(/^[a-f\d]{24}$/i),
      score: z.number().finite().min(0),
    }).strict(),
  ).min(1),
}).strict();

router.use(authenticate, authorize("teacher"));
router.get("/class/:classId", ownsClass, getGradesForClass);
router.put("/class/:classId", validate(gradesSchema), ownsClass, enterGrades);

export default router;

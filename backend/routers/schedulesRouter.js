import express from "express";
import {
  createSchedule,
  deleteSchedule,
  listSchedules,
  updateSchedule,
} from "../Controllers/scheduleController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import ownsClass from "../middleware/ownsClass.js";
import validate from "../middleware/validate.js";
import { z } from "zod";

const router = express.Router();
const scheduleFields = {
  day: z.enum(["sat", "sun", "mon", "tue", "wed", "thu"]),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
};
const createScheduleSchema = z.object({
  class_id: z.string().regex(/^[a-f\d]{24}$/i),
  ...scheduleFields,
}).strict();
const updateScheduleSchema = z.object(scheduleFields).strict();

router.use(authenticate, authorize("teacher"));
router.get("/", listSchedules);
router.post("/", validate(createScheduleSchema), ownsClass, createSchedule);
router.patch("/:id", validate(updateScheduleSchema), ownsClass, updateSchedule);
router.delete("/:id", ownsClass, deleteSchedule);

export default router;

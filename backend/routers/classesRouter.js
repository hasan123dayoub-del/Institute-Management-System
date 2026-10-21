import { Router } from "express";
import { z } from "zod";
import { create, get, list, remove, start, students, update } from "../Controllers/classController.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { LEVEL_CODES } from "../Models/levelModel.js";

const router = Router();

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const CreateClass = z.object({
  level: z.enum(LEVEL_CODES),
  shift: z.enum(["morning", "evening"]),
  teacher_id: objectId,
  room: z.string().trim().optional(),
  capacity: z.coerce.number().int().min(1).max(100).default(20),
  start_date: z.coerce.date(),
});

// Level, shift and start date identify the class: they cannot change.
const UpdateClass = z
  .object({
    teacher_id: objectId,
    room: z.string().trim(),
    capacity: z.coerce.number().int().min(1).max(100),
  })
  .partial();

// The secretary runs the classes. A teacher only reads their own (the service checks which ones).
router.get("/", authorize("secretary", "teacher"), list);
router.get("/:id", authorize("secretary", "teacher"), get);
router.get("/:id/students", authorize("secretary", "teacher"), students);
router.post("/", authorize("secretary"), validate(CreateClass), create);
router.patch("/:id", authorize("secretary"), validate(UpdateClass), update);
router.post("/:id/start", authorize("secretary"), start);
router.delete("/:id", authorize("secretary"), remove);

export default router;

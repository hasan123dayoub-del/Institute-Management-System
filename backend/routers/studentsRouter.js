import { Router } from "express";
import { z } from "zod";
import { MIN_LENGTH } from "../lib/password.js";
import { create, list, me, move, remove, update } from "../Controllers/studentController.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { LEVEL_CODES } from "../Models/levelModel.js";

const router = Router();

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const optionalText = z.string().trim().optional();

const CreateStudent = z.object({
  full_name: z.string().trim().min(1),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(MIN_LENGTH),
  phone: optionalText,
  gender: z.enum(["male", "female"]).optional(),
  birth_date: z.coerce.date().optional(),
  guardian_phone: optionalText,
  address: optionalText,
  placement_score: z.coerce.number().min(0).max(100).optional(),
  level: z.enum(LEVEL_CODES),
  class_id: objectId.nullish(), // empty = the waiting list
});

// The email (their login) and the level are not edited here. "withdrawn" is the only status that can be set.
const UpdateStudent = z
  .object({
    full_name: z.string().trim().min(1),
    phone: z.string().trim(),
    gender: z.enum(["male", "female", ""]),
    birth_date: z.union([z.coerce.date(), z.literal("")]),
    guardian_phone: z.string().trim(),
    address: z.string().trim(),
    placement_score: z.coerce.number().min(0).max(100),
    status: z.literal("withdrawn"),
  })
  .partial();

const MoveStudent = z.object({ class_id: objectId });

// The student portal comes first so "me" is not read as an id.
router.get("/me", authorize("student"), me);

// Everything else belongs to the secretary.
router.use(authorize("secretary"));
router.get("/", list);
router.post("/", validate(CreateStudent), create);
router.patch("/:id", validate(UpdateStudent), update);
router.patch("/:id/class", validate(MoveStudent), move);
router.delete("/:id", remove);

export default router;

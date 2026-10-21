import { Router } from "express";
import { z } from "zod";
import { MIN_LENGTH } from "../lib/password.js";
import validate from "../middleware/validate.js";
import authorize from "../middleware/authorize.js";
import {
  list,
  create,
  update,
  pay,
} from "../Controllers/teacherController.js";

const router = Router();

const CreateTeacher = z.object({
  full_name: z.string().trim().min(1),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(MIN_LENGTH),
  phone: z.string().trim().optional(),
  qualification: z.string().trim().optional(),
  hire_date: z.coerce.date(),
  salary: z.coerce.number().min(0),
});

// Password is NOT editable here: use PATCH /users/:id/password (with the teacher's user_id).
const UpdateTeacher = z
  .object({
    full_name: z.string().trim().min(1),
    email: z.string().trim().email().toLowerCase(),
    phone: z.string().trim(),
    is_active: z.boolean(),
    qualification: z.string().trim(),
    hire_date: z.coerce.date(),
    salary: z.coerce.number().min(0),
  })
  .partial();

// Admin may look at the list (salaries); the secretary does everything.
router.get("/", authorize("secretary", "admin"), list);
router.post("/", authorize("secretary"), validate(CreateTeacher), create);
router.patch("/:id", authorize("secretary"), validate(UpdateTeacher), update);
router.post("/:id/pay", authorize("secretary"), pay);

export default router;

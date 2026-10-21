import { Router } from "express";
import { z } from "zod";
import { MIN_LENGTH } from "../lib/password.js";
import validate from "../middleware/validate.js";
import authorize from "../middleware/authorize.js";
import {
  list,
  create,
  update,
  remove,
} from "../Controllers/secretaryController.js";

const router = Router();

const CreateSecretary = z.object({
  full_name: z.string().trim().min(1),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().optional(),
  password: z.string().min(MIN_LENGTH),
});

// Password is NOT editable here: use PATCH /users/:id/password.
const UpdateSecretary = z
  .object({
    full_name: z.string().trim().min(1),
    email: z.string().trim().email().toLowerCase(),
    phone: z.string().trim(),
    is_active: z.boolean(),
  })
  .partial();

// Admin only, for every route in this file.
router.use(authorize("admin"));

router.get("/", list);
router.post("/", validate(CreateSecretary), create);
router.patch("/:id", validate(UpdateSecretary), update);
router.delete("/:id", remove);

export default router;

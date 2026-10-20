import { Router } from "express";
import { z } from "zod";
import validate from "../middleware/validate.js";
import authenticate from "../middleware/authenticate.js";
import { login, me } from "../Controllers/authController.js";

const router = Router();

const LoginInput = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

router.post("/login", validate(LoginInput), login);
router.get("/me", authenticate, me);

export default router;

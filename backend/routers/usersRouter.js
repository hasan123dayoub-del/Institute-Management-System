import { Router } from "express";
import authorize from "../middleware/authorize.js";
import { setPassword } from "../Controllers/userController.js";

const router = Router();

router.patch("/:id/password", authorize("admin", "secretary"), setPassword);

export default router;

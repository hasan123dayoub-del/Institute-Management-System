import { Router } from "express";
import { list } from "../Controllers/levelController.js";

const router = Router();

// Any logged in user may read the levels.
router.get("/", list);

export default router;

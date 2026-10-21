import express from "express";
import { getAdminStats } from "../Controllers/statsController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// مسار جلب إحصائيات المعهد الإجمالية: GET /api/stats/overview
router.get("/overview", authenticate, authorize("admin"), getAdminStats);

export default router;

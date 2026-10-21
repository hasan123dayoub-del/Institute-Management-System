import express from "express";
import { getAdminBreakdown, getAdminStats } from "../Controllers/statsController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// مسار جلب إحصائيات المعهد الإجمالية: GET /api/stats/overview
router.get("/overview", authenticate, authorize("admin"), getAdminStats);

// Numbers for the dashboard charts: GET /api/stats/breakdown
router.get("/breakdown", authenticate, authorize("admin"), getAdminBreakdown);

export default router;

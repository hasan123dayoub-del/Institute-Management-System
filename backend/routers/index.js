import express from "express";
import authRouter from "./authRouter.js";
import schedulesRouter from "./schedulesRouter.js";
import gradesRouter from "./gradesRouter.js";
import resultsRouter from "./resultsRouter.js";
import statsRouter from "./statsRouter.js";
// ... استيراد بقية مسارات زملائك في الفريق هنا

const router = express.Router();

router.use("/auth", authRouter);
router.use("/schedules", schedulesRouter);
router.use("/grades", gradesRouter);
router.use("/results", resultsRouter);
router.use("/stats", statsRouter);

export default router;

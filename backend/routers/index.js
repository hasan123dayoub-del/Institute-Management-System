import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import authRouter from "./authRouter.js";
import usersRouter from "./usersRouter.js"; // P1
import secretariesRouter from "./secretariesRouter.js"; // P1
import teachersRouter from "./teachersRouter.js"; // P1
import levelsRouter from "./levelsRouter.js"; // P2
import classesRouter from "./classesRouter.js"; // P2
import studentsRouter from "./studentsRouter.js"; // P2
import schedulesRouter from "./schedulesRouter.js"; // P3
import gradesRouter from "./gradesRouter.js"; // P3
import resultsRouter from "./resultsRouter.js"; // P3
import statsRouter from "./statsRouter.js"; // P3

const router = Router();

// Public
router.use("/auth", authRouter);

// Everything below needs a valid token. Each owner adds only their own lines.
router.use(authenticate);
router.use("/users", usersRouter);
router.use("/secretaries", secretariesRouter);
router.use("/teachers", teachersRouter);
router.use("/levels", levelsRouter);
router.use("/classes", classesRouter);
router.use("/students", studentsRouter);
router.use("/schedules", schedulesRouter);
router.use("/grades", gradesRouter);
router.use("/results", resultsRouter);
router.use("/stats", statsRouter);

export default router;

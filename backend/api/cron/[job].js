// The scheduled jobs on Vercel (server.js runs them with timers when the API runs locally).
// Vercel Cron calls /api/cron/finish-classes every night and /api/cron/reset-salaries on the
// 1st of each month (see vercel.json), with the CRON_SECRET as a Bearer token.
import "dotenv/config";
import connectDB from "../../config/db.js";
import Teacher from "../../Models/teacherModel.js";
import { finishClasses } from "../../jobs/finishClasses.js";

const jobs = {
  "finish-classes": async () => ({ finished: (await finishClasses()).length }),
  "reset-salaries": async () => {
    const result = await Teacher.updateMany({}, { salary_status: "unpaid" });
    return { reset: result.modifiedCount };
  },
};

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const job = jobs[req.query.job];
  if (!job) {
    return res.status(404).json({ message: "Unknown job" });
  }
  await connectDB();
  return res.json({ job: req.query.job, ...(await job()) });
}

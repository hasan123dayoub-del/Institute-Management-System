import cron from "node-cron";
import Teacher from "../Models/teacherModel.js";

// Midnight on the 1st of every month: everyone is unpaid again.
export const start = () =>
  cron.schedule("0 0 1 * *", () =>
    Teacher.updateMany({}, { salary_status: "unpaid" }),
  );

import "dotenv/config"; // must stay the first import
import app from "./app.js";
import connectDB from "./config/db.js";
import { start as startResetSalaries } from "./jobs/resetSalaries.js";
import { start as startFinishClasses } from "./jobs/finishClasses.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  startResetSalaries();
  startFinishClasses();
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
} catch (err) {
  console.error(err);
  process.exit(1);
}

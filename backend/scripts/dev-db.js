// npm run db
// Starts a LOCAL MongoDB for this project, as a one-node replica set.
// Why: creating a student, moving a student and finishing a course use transactions, and MongoDB only
// allows transactions on a replica set (a plain `mongod` or the Windows service cannot).
// It does not touch your other databases or the MongoDB service: it listens on its own port and keeps its
// files in backend/.data (ignored by git). Leave this terminal open while you work; Ctrl+C stops it.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const PORT = 27019;
const REPLICA_SET = "rs0";
const dbPath = path.resolve(import.meta.dirname, "../.data/mongo");
mkdirSync(dbPath, { recursive: true });

const mongod = spawn(
  "mongod",
  ["--replSet", REPLICA_SET, "--port", String(PORT), "--dbpath", dbPath, "--bind_ip", "127.0.0.1"],
  { stdio: ["ignore", "ignore", "inherit"] },
);
mongod.on("error", (err) => {
  console.error(`Cannot start mongod (${err.message}). Is MongoDB installed and is mongod in your PATH?`);
  process.exit(1);
});
mongod.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => mongod.kill());

// The first time only, the replica set must be "initiated". Retry until mongod accepts connections.
async function initiate() {
  for (let attempt = 0; attempt < 30; attempt++) {
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:${PORT}/?directConnection=true`, { serverSelectionTimeoutMS: 1000 });
    try {
      await conn.asPromise();
      const admin = conn.db.admin();
      try {
        await admin.command({ replSetGetStatus: 1 });
      } catch (err) {
        if (err.codeName !== "NotYetInitialized") throw err;
        await admin.command({ replSetInitiate: { _id: REPLICA_SET, members: [{ _id: 0, host: `127.0.0.1:${PORT}` }] } });
      }
      console.log(`MongoDB replica set ready on port ${PORT}.`);
      console.log(`Use in backend/.env:  MONGO_URI=mongodb://127.0.0.1:${PORT}/ascend?replicaSet=${REPLICA_SET}`);
      console.log("Leave this terminal open. Ctrl+C stops the database.");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      await conn.close().catch(() => {});
    }
  }
  console.error("MongoDB did not become ready in 30 seconds.");
  mongod.kill();
}

initiate();

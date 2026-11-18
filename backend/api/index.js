// Vercel runs the API as one serverless function: vercel.json sends every path here.
// The MongoDB connection is opened on the first request and reused while the function
// stays warm (server.js, which connects once and listens, is only for running locally).
import "dotenv/config";
import app from "../app.js";
import connectDB from "../config/db.js";

let connecting;

export default async function handler(req, res) {
  try {
    connecting ??= connectDB();
    await connecting;
  } catch (error) {
    connecting = undefined; // try again on the next request
    console.error(error);
    return res.status(503).json({ message: "Database unavailable", code: "DB_UNAVAILABLE" });
  }
  return app(req, res);
}

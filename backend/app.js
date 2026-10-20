import express from "express";
import cors from "cors";
import routes from "./routers/index.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", routes);

app.use((req, res) =>
  res.status(404).json({ message: "Route not found", code: "NOT_FOUND" }),
);
app.use(errorHandler);

export default app;

import express from "express";
import cors from "cors";
import routes from "./routers/index.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// CLIENT_ORIGIN can be a full URL or a bare host (Render's blueprint passes the dashboard host only).
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: /^https?:\/\//.test(clientOrigin) ? clientOrigin : `https://${clientOrigin}` }));
app.use(express.json());

// The API has no page of its own; point visitors who open the bare URL to the right places.
app.get("/", (req, res) =>
  res.json({
    name: "Ascend Institute API",
    status: "running",
    health: "/api/health",
    dashboard: "https://institute-dashboard-gnsa.onrender.com",
  }),
);
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", routes);

app.use((req, res) =>
  res.status(404).json({ message: "Route not found", code: "NOT_FOUND" }),
);
app.use(errorHandler);

export default app;

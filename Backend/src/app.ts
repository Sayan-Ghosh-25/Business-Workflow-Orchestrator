// src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import routesAuth from "./routes/auth";
import routesWorkflows from "./routes/workflows";
import routesApprovals from "./routes/approvals";
import routesAudit from "./routes/audit";
import routesMetrics from "./routes/metrics";
import notificationsRouter from "./routes/notifications";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.get("/", (_req, res) => { res.send("Backend Running Successfully!"); });
app.use("/auth", routesAuth);
app.use("/workflows", routesWorkflows);
app.use("/approvals", routesApprovals);
app.use("/audit", routesAudit);
app.use("/metrics", routesMetrics);
app.use("/notifications", notificationsRouter);

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Error handler
app.use(errorHandler);

export default app;

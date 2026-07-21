// src/routes/metrics.ts
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getMetrics } from "../controllers/metricsController";

const router = express.Router();

router.get("/", authMiddleware, getMetrics);

export default router;

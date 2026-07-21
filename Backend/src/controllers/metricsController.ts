// src/controllers/metricsController.ts
import { Request, Response, NextFunction } from "express";
import * as metricsService from "../services/metricsService";

export async function getMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await metricsService.buildMetrics();
    res.json(metrics);
  } catch (err) {
    next(err);
  }
}

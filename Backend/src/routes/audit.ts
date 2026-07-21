// src/routes/audit.ts
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { listAudit } from "../controllers/auditController";

const router = express.Router();

router.get("/", authMiddleware, listAudit);

export default router;

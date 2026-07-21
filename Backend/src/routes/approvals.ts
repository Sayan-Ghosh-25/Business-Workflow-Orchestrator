// src/routes/approvals.ts
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { listApprovalsController, performApproval } from "../controllers/approvalsController";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["approver","admin"]), listApprovalsController);
router.post("/:id/action", authMiddleware, roleMiddleware(["approver","admin"]), performApproval);

export default router;

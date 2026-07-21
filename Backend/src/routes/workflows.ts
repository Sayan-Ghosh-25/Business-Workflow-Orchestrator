// src/routes/workflows.ts
import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  createWorkflow,
  listWorkflows,
  getWorkflow,
  submitWorkflow,
  approveWorkflowController,
  withdrawWorkflowController
} from "../controllers/workflowsController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024) } });

// create/upload workflow
router.post("/", authMiddleware, upload.single("file"), createWorkflow);

// list
router.get("/", authMiddleware, listWorkflows);

// get detail
router.get("/:id", authMiddleware, getWorkflow);

// submit edited
router.post("/:id/submit", authMiddleware, submitWorkflow);

// approve/reject/request_changes
router.post("/:id/approve", authMiddleware, approveWorkflowController);

// withdraw
router.post("/:id/withdraw", authMiddleware, withdrawWorkflowController);

export default router;

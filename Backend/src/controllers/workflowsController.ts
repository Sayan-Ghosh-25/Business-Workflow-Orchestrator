// src/controllers/workflowsController.ts
import { Request, Response, NextFunction } from "express";
import * as workflowService from "../services/workflowService";
import { query } from "../services/dbService";

// Create/upload workflow
export async function createWorkflow(req: any, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "file required" });
    const type = req.body.type || "doc";
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    const submitterId = req.user?.userId;
    const wf = await workflowService.createWorkflowRecord({
      type,
      submitterId,
      attachmentBuffer: file.buffer,
      attachmentName: file.originalname,
      metadata
    });
    // wf is mapped full workflow
    res.status(201).json(wf);
  } catch (err) {
    next(err);
  }
}

// List with pagination & filters — returns { data, total }
export async function listWorkflows(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, type, q, page = 1, pageSize = 20 } = req.query;
    const result = await workflowService.listWorkflows({ status, type, q, page: Number(page), pageSize: Number(pageSize) });
    // result already shaped as { data, total }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Get detail — returns full mapped workflow
export async function getWorkflow(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const wf = await workflowService.getWorkflowById(Array.isArray(id) ? id[0] : id);
    if (!wf) return res.status(404).json({ error: "not found" });
    res.json(wf);
  } catch (err) {
    next(err);
  }
}

// Submit edits
export async function submitWorkflow(req: any, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const payload = req.body;
    // save edits into ai_result or metadata per contract
    await query(`UPDATE public.workflows SET ai_result = $1, metadata = $2, updated_at = now() WHERE id = $3`, [payload.aiResult || null, payload.metadata || {}, id]);
    await query(`INSERT INTO public.workflow_history (workflow_id, from_status, to_status, actor, comment, created_at) VALUES ($1,$2,$3,$4,$5,now())`, [id, null, "UNDER_REVIEW", req.user?.userId, "Submitted edits"]);
    // return updated mapped workflow
    const wf = await workflowService.getWorkflowById(id);
    res.json(wf);
  } catch (err) {
    next(err);
  }
}

// Approve/reject/request_changes endpoint (called from UI)
export async function approveWorkflowController(req: any, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;
    const approverId = req.user?.userId;
    const wf = await workflowService.approveWorkflowRecord(id, approverId, action, comment || "");
    res.json(wf);
  } catch (err) {
    next(err);
  }
}

// Withdraw workflow (submitter)
export async function withdrawWorkflowController(req: any, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const actorId = req.user?.userId;
    const wf = await workflowService.withdrawWorkflowRecord(id, actorId);
    res.json(wf);
  } catch (err) {
    next(err);
  }
}

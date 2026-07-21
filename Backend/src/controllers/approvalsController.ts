// src/controllers/approvalsController.ts
import { Request, Response, NextFunction } from "express";
import * as workflowService from "../services/workflowService";

/* GET /approvals
 * Returns an array of workflows assigned to the current approver */
export async function listApprovalsController(req: any, res: Response, next: NextFunction) {
  try {
    const approverId = req.user?.userId;
    if (!approverId) return res.status(401).json({ error: "unauthorized" });

    const workflows = await workflowService.getApprovalsForUser(approverId);
    res.json(workflows);
  } catch (err) {
    next(err);
  }
}

/* POST /approvals/:id/action
 * Performs approve/reject/request_changes for the given workflow as current approver.
 * Returns the updated mapped workflow object */
export async function performApproval(req: any, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;
    const approverId = req.user?.userId;
    if (!approverId) return res.status(401).json({ error: "unauthorized" });

    // call the shared workflow approval service (returns mapped workflow)
    const wf = await workflowService.approveWorkflowRecord(id, approverId, action, comment || "");
    res.json(wf);
  } catch (err) {
    next(err);
  }
}

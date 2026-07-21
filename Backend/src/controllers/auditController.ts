// src/controllers/auditController.ts
import { Request, Response, NextFunction } from "express";
import * as auditService from "../services/auditService";

/* GET /audit
 * Query params: workflowId, userId, from, to, page, pageSize
 * Returns: { items: AuditLog[], total: number } */
export async function listAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const { workflowId, userId, from, to } = req.query;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;

    const result = await auditService.listAuditLogs({
      workflowId: typeof workflowId === "string" ? workflowId : undefined,
      userId: typeof userId === "string" ? userId : undefined,
      from: typeof from === "string" ? from : undefined,
      to: typeof to === "string" ? to : undefined,
      page,
      pageSize,
    });

    // returns { items, total }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

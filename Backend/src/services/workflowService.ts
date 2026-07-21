// src/services/workflowService.ts
import { query } from "./dbService";
import { uploadFile } from "./storageService";
import { processFileByUrl, AiResult } from "./aiService";

const AUTO_APPROVE_THRESHOLD = Number(process.env.AI_AUTO_APPROVE_THRESHOLD || 0.9);

// Map DB row to frontend-friendly summary/workflow shape
function mapRowToSummary(row: any) {
  return {
    id: row.id,
    type: row.type,
    // submitter may have been joined as submitter_name
    submitter: row.submitter ? { id: row.submitter, name: row.submitter_name || null } : null,
    submittedAt: row.submitted_at ? row.submitted_at.toISOString ? row.submitted_at.toISOString() : row.submitted_at : null,
    status: row.status,
    assignedTo: row.assigned_to ? { id: row.assigned_to, name: row.assigned_to_name || null } : null,
    aiResult: row.ai_result || null,
    metadata: row.metadata || {},
    // attachments derived from attachment_url
    attachments: row.attachment_url ? [{ id: row.attachment_url, name: row.attachment_name || "document.pdf", url: row.attachment_url }] : [],
    updatedAt: row.updated_at ? (row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at) : null
  };
}

// Map full workflow + history + audits
function mapFullWorkflow(row: any, history: any[], auditRows: any[]) {
  const mapped = {
    id: row.id,
    type: row.type,
    submitter: row.submitter ? { id: row.submitter, name: row.submitter_name || null } : null,
    submittedAt: row.submitted_at ? (row.submitted_at.toISOString ? row.submitted_at.toISOString() : row.submitted_at) : null,
    status: row.status,
    assignedTo: row.assigned_to ? { id: row.assigned_to, name: row.assigned_to_name || null } : null,
    aiResult: row.ai_result || null,
    metadata: row.metadata || {},
    attachments: row.attachment_url ? [{ id: row.attachment_url, name: row.attachment_name || "document.pdf", url: row.attachment_url }] : [],
    history: (history || []).map((h: any) => ({
      id: h.id,
      fromStatus: h.from_status,
      toStatus: h.to_status,
      actor: h.actor,
      comment: h.comment,
      createdAt: h.created_at ? (h.created_at.toISOString ? h.created_at.toISOString() : h.created_at) : null
    })),
    auditLogs: (auditRows || []).map((a: any) => ({
      id: a.id,
      action: a.action,
      actor: a.actor,
      details: a.details,
      timestamp: a.created_at ? (a.created_at.toISOString ? a.created_at.toISOString() : a.created_at) : null
    })),
    updatedAt: row.updated_at ? (row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at) : null
  };
  return mapped;
}

// Create workflow record: uploads file to storage, inserts DB, calls AI, updates status - Returns mapped full workflow
export async function createWorkflowRecord({ type, submitterId, attachmentBuffer, attachmentName, metadata }: {
  type: string;
  submitterId: string;
  attachmentBuffer: Buffer;
  attachmentName: string;
  metadata?: any;
}) {
  // 1) upload file
  const key = `workflows/${Date.now()}-${attachmentName}`;
  const { publicUrl } = await uploadFile(attachmentBuffer, key, "application/pdf");

  // 2) insert DB row
  const id = `WF-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*900+100)}`;
  const insert = `
    INSERT INTO public.workflows (id, type, submitter, submitted_at, status, attachment_url, attachment_name, metadata, updated_at)
    VALUES ($1,$2,$3,now(),$4,$5,$6,$7,now())
    RETURNING *;
  `;
  const res = await query(insert, [id, type, submitterId, "NEW", publicUrl, attachmentName, metadata || {}]);
  const wfRow = res.rows[0];

  // 3) call AI synchronously (could be async in production)
  try {
    const aiRes: AiResult = await processFileByUrl(publicUrl);

    const status = aiRes.confidence >= AUTO_APPROVE_THRESHOLD ? "AI_AUTO_APPROVED" : "AI_PROCESSED";
    const upd = `UPDATE public.workflows SET ai_result = $1, status = $2, updated_at = now() WHERE id = $3 RETURNING *;`;
    await query(upd, [aiRes, status, id]);

    if (status === "AI_AUTO_APPROVED") {
      await query(
        `INSERT INTO public.workflow_history (workflow_id, from_status, to_status, actor, comment, created_at)
         VALUES ($1,$2,$3,$4,$5,now())`,
        [id, "NEW", "APPROVED", null, "Auto-approved by AI"]
      );
      await query(`INSERT INTO public.approvals (workflow_id, approver, action, comment, created_at) VALUES ($1,$2,$3,$4,now())`, [id, null, "auto_approve", "Auto-approved"]);
    } else {
      const approverRes = await query(`SELECT id FROM public.users WHERE role='approver' LIMIT 1`);
      const approver = approverRes.rows[0]?.id || null;
      await query(`UPDATE public.workflows SET assigned_to = $1 WHERE id = $2`, [approver, id]);
      await query(`INSERT INTO public.workflow_history (workflow_id, from_status, to_status, actor, comment, created_at) VALUES ($1,$2,$3,$4,$5,now())`, [id, "NEW", "AI_PROCESSED", null, "AI processed, awaiting review"]);
    }

    // Return fully mapped workflow (with joins)
    return getWorkflowById(id);
  } catch (err) {
    await query(`UPDATE public.workflows SET status=$1, updated_at=now() WHERE id=$2`, ["AI_FAILED", id]);
    throw err;
  }
}

/* List workflows — returns { data: [...], total }
 * Joins user names for convenience. */
export async function listWorkflows({ status, type, q, page = 1, pageSize = 20 }: any) {
  const offset = (page - 1) * pageSize;
  const where: string[] = [];
  const params: any[] = [];
  if (status) { params.push(status); where.push(`w.status = $${params.length}`); }
  if (type) { params.push(type); where.push(`w.type = $${params.length}`); }
  if (q) { params.push(`%${q}%`); where.push(`(w.id ILIKE $${params.length} OR w.metadata->>'caption' ILIKE $${params.length})`); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRes = await query(`SELECT count(*) FROM public.workflows w ${whereSql}`, params);
  const total = Number(totalRes.rows[0].count || 0);

  // join to get submitter / assigned names
  const sql = `
    SELECT w.*, su.name as submitter_name, au.name as assigned_to_name
    FROM public.workflows w
    LEFT JOIN public.users su ON w.submitter = su.id
    LEFT JOIN public.users au ON w.assigned_to = au.id
    ${whereSql}
    ORDER BY w.submitted_at DESC
    LIMIT $${params.length+1} OFFSET $${params.length+2};
  `;
  const dataRes = await query(sql, [...params, pageSize, offset]);
  const items = dataRes.rows.map(mapRowToSummary);
  return { data: items, total };
}

// Get full workflow by id — returns mapped workflow with history and auditLogs
export async function getWorkflowById(id: string) {
  // fetch workflow + submitter name + assigned_to name
  const sql = `
    SELECT w.*, su.name as submitter_name, au.name as assigned_to_name
    FROM public.workflows w
    LEFT JOIN public.users su ON w.submitter = su.id
    LEFT JOIN public.users au ON w.assigned_to = au.id
    WHERE w.id = $1
    LIMIT 1;
  `;
  const res = await query(sql, [id]);
  const row = res.rows[0];
  if (!row) return null;

  const history = (await query(`SELECT * FROM public.workflow_history WHERE workflow_id=$1 ORDER BY created_at DESC`, [id])).rows;
  const auditRows = (await query(`SELECT * FROM public.audit_logs WHERE workflow_id=$1 ORDER BY created_at DESC`, [id])).rows;
  return mapFullWorkflow(row, history, auditRows);
}

// Approve workflow (from controller)
export async function approveWorkflowRecord(id: string, approverId: string | null, action: string, comment: string) {
  await query(`INSERT INTO public.approvals (workflow_id, approver, action, comment, created_at) VALUES ($1,$2,$3,$4,now())`, [id, approverId, action, comment]);
  const status = action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : "UNDER_REVIEW";
  await query(`UPDATE public.workflows SET status=$1, updated_at=now() WHERE id=$2`, [status, id]);
  await query(`INSERT INTO public.workflow_history (workflow_id, from_status, to_status, actor, comment, created_at) VALUES ($1,$2,$3,$4,$5,now())`, [id, null, status, approverId, comment]);
  await query(`INSERT INTO public.audit_logs (workflow_id, action, actor, details, created_at) VALUES ($1,$2,$3,$4,now())`, [id, action, approverId, { comment }]);
  // Return mapped workflow
  return getWorkflowById(id);
}

// Withdraw workflow (submitter withdraws)
export async function withdrawWorkflowRecord(id: string, actorId: string | null) {
  await query(`UPDATE public.workflows SET status=$1, updated_at=now() WHERE id=$2`, ["WITHDRAWN", id]);
  await query(`INSERT INTO public.workflow_history (workflow_id, from_status, to_status, actor, comment, created_at) VALUES ($1,$2,$3,$4,$5,now())`, [id, null, "WITHDRAWN", actorId, "Withdrawn by submitter"]);
  await query(`INSERT INTO public.audit_logs (workflow_id, action, actor, details, created_at) VALUES ($1,$2,$3,$4,now())`, [id, "withdraw", actorId, { }]);
  return getWorkflowById(id);
}

/* Return full mapped workflows that are assigned to the given approver
  * Uses existing getWorkflowById mapping to keep shape identical to other endpoints */
export async function getApprovalsForUser(approverId: string) {
  const res = await query(
    `SELECT id FROM public.workflows WHERE assigned_to = $1 ORDER BY submitted_at DESC`,
    [approverId]
  );
  const ids: string[] = res.rows.map((r: any) => r.id);

  // fetch full mapped workflows in parallel (getWorkflowById returns mapped shape)
  const items = await Promise.all(
    ids.map(async (id) => {
      try {
        return await getWorkflowById(id);
      } catch (err) {
        console.warn("failed to fetch workflow detail for", id, err);
        return null;
      }
    })
  );
  return items.filter(Boolean);
}

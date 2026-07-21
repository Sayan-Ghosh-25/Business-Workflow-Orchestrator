// lib/api/audit.ts
import apiClient from "./client";

/** Types used by UI */
export type AuditActor = {
  id?: string | null;
  name?: string;
};

export type AuditLog = {
  id: string;
  workflowId?: string;
  action?: string;
  actor?: AuditActor;
  details?: string;
  timestamp?: string; // ISO
};

export type AuditFilters = {
  workflowId?: string;
  userId?: string;
  from?: string; // ISO date 'YYYY-MM-DD'
  to?: string; // ISO date
  page?: number;
  pageSize?: number;
  q?: string;
};

/* getAuditLogs returns an array of AuditLog items
 * The backend returns { items, total } */
export async function getAuditLogs(params: AuditFilters = {}): Promise<AuditLog[]> {
  const res = await apiClient.get("/audit", { params });
  // backend returns { items, total }
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

/** Convenience: get audit logs for a single workflow (returns array) */
export async function getAuditForWorkflow(workflowId: string): Promise<AuditLog[]> {
  const res = await apiClient.get("/audit", { params: { workflowId } });
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

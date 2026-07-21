// lib/api/approvals.ts
import apiClient from "./client";

export type ApprovalItem = {
  workflowId?: string;
  workflow?: any;
  assignedAt?: string;
  approver?: { id: string; name?: string };
};

// Returns approvals assigned to current user — returns Workflow[] or empty array
export async function getApprovals(params: any = []) {
  const res = await apiClient.get("/approvals", { params });
  if (res.data) {
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.items)) return res.data.items;
  }
  return [];
}

// Get a specific approval item (if implemented)
export async function getApproval(id: string) {
  const res = await apiClient.get(`/approvals/${encodeURIComponent(id)}`);
  return res.data;
}

// Perform approval action (approve/reject/request_changes)
export async function performApprovalAction(id: string, action: "approve" | "reject" | "request_changes", comment = "") {
  const res = await apiClient.post(`/approvals/${encodeURIComponent(id)}/action`, { action, comment });
  return res.data;
}

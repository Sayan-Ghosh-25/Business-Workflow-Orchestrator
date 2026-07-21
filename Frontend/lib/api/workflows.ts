// lib/api/workflows.ts
import apiClient from "./client";

export type Workflow = {
  id: string;
  type: string;
  submitter?: { id: string; name?: string };
  submittedAt?: string;
  status?: string;
  assignedTo?: { id: string; name?: string } | null;
  aiResult?: any;
  attachments?: { id: string; name: string; url: string }[];
  metadata?: any;
  history?: any[];
  audit?: any[];
};

export type WorkflowFilters = {
  status?: string;
  type?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type AIResult = {
  resultType: string;
  confidence: number;
  fields: Record<string, string | number>;
  raw?: any;
};

/** List workflows (used by dashboard/workflows pages) */
export async function getWorkflows(params: WorkflowFilters = {}) {
  const res = await apiClient.get("/workflows", { params });
  // expected { items: [...], total }
  return res.data;
}

/** Get a single workflow by id (used by workflow detail page) */
export async function getWorkflowById(id: string): Promise<Workflow> {
  const res = await apiClient.get(`/workflows/${encodeURIComponent(id)}`);
  return res.data;
}

/** Create/upload a workflow (FormData) */
export async function createWorkflow(formData: FormData) {
  const res = await apiClient.post("/workflows", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // onUploadProgress: (ev) => { /* optional progress */ }
  });
  return res.data;
}

/** Withdraw a workflow (simple POST) */
export async function withdrawWorkflow(id: string) {
  const res = await apiClient.post(`/workflows/${encodeURIComponent(id)}/withdraw`);
  return res.data;
}

/** Submit edits after user modifies AI-extracted fields */
export async function submitWorkflow(id: string, payload: any) {
  const res = await apiClient.post(`/workflows/${encodeURIComponent(id)}/submit`, payload);
  return res.data;
}

/** Approve/reject/request_changes action on workflow (UI may call this) */
export async function approveWorkflow(id: string, action: "approve" | "reject" | "request_changes", comment = "") {
  const res = await apiClient.post(`/workflows/${encodeURIComponent(id)}/approve`, { action, comment });
  return res.data;
}

// lib/api/metrics.ts
import apiClient from "./client";

export type MetricsSummary = {
  totalDocuments: number;
  autoApproved: number;
  autoApprovalRate: number;
  avgTurnaroundHours: number;
  timeSavedHours: number;
  pendingReview: number;
  rejectedCount: number;
};

export type MonthlyTrend = {
  month: string;
  year: number;
  autoApproved: number;
  manual: number;
  submitted: number;
};

export type MetricsData = {
  summary: MetricsSummary;
  monthlyTrend: MonthlyTrend[];
  byType: { type: string; count: number }[];
  turnaroundDistribution: { range: string; count: number }[];
  confidenceDistribution: { range: string; count: number }[];
};

export async function getMetrics(): Promise<MetricsData> {
  const res = await apiClient.get("/metrics");
  return res.data;
}

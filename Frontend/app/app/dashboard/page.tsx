"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { getWorkflows, type Workflow } from "@/lib/api/workflows";
import { getMetrics, type MetricsData } from "@/lib/api/metrics";
import { MetricCard } from "@/components/app/metric-card";
import { StatusBadge } from "@/components/app/status-badge";
import { SkeletonCard } from "@/components/app/skeleton-rows";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, TrendingUp, ArrowRight, Upload, BarChart3, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [wfRes, metricsRes] = await Promise.all([
        getWorkflows({ pageSize: 5 }),
        getMetrics(),
      ]);
      setWorkflows(wfRes.data);
      setMetrics(metricsRes);
    } catch {
      // Error handled silently with empty states
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0] || "User"}</h1>
          <p className="text-sm text-muted-foreground">
            {"Here's an overview of your workflow activity"}
          </p>
        </div>
        <Button asChild className="gap-2 w-fit">
          <Link href="/app/workflows">
            <Upload className="h-4 w-4" /> New Workflow
          </Link>
        </Button>
      </div>

      {/* KPI Tiles */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Documents"
            value={metrics.summary.totalDocuments}
            subtitle="All time submissions"
            icon={<FileText className="h-5 w-5" />}
            trend={{ value: 12, label: "vs last month" }}
          />
          <MetricCard
            title="Auto-Approved"
            value={`${metrics.summary.autoApprovalRate}%`}
            subtitle={`${metrics.summary.autoApproved} documents`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            trend={{ value: 5, label: "vs last month" }}
          />
          <MetricCard
            title="Avg Turnaround"
            value={`${metrics.summary.avgTurnaroundHours}h`}
            subtitle="Average processing time"
            icon={<Clock className="h-5 w-5" />}
            trend={{ value: -8, label: "vs last month" }}
          />
          <MetricCard
            title="Time Saved"
            value={`${metrics.summary.timeSavedHours}h`}
            subtitle="Hours saved by automation"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: 15, label: "vs last month" }}
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Workflows */}
        <Card className="border border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Workflows</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/app/workflows" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : workflows.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No workflows yet. Upload your first document to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {workflows.slice(0, 5).map((wf) => (
                  <Link
                    key={wf.id}
                    href={`/app/workflows/${wf.id}`}
                    className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      <p className="truncate text-sm font-medium text-foreground">{wf.id}</p>
                      <p className="text-xs text-muted-foreground">
                      <span className="capitalize">{wf.type || "Unknown"}</span> &middot;{" "}
                        {wf.submitter?.name || "System"} &middot;{" "}
                        {wf.submittedAt ? format(new Date(wf.submittedAt), "MMM d, h:mm a") : "Pending"}
                      </p>
                    </div>
                    <StatusBadge status={wf.status || "PENDING"} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Summary */}
        <div className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" asChild>
                <Link href="/app/workflows"><Upload className="h-4 w-4" /> Upload Document</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" asChild>
                <Link href="/app/approvals"><CheckCircle2 className="h-4 w-4" /> Review Approvals</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" asChild>
                <Link href="/app/audit"><AlertTriangle className="h-4 w-4" /> Audit Trail</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" asChild>
                <Link href="/app/metrics"><BarChart3 className="h-4 w-4" /> View Metrics</Link>
              </Button>
            </CardContent>
          </Card>

          {metrics && (
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Pending Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Review</span>
                  <span className="text-sm font-semibold text-foreground">{metrics.summary.pendingReview}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rejected</span>
                  <span className="text-sm font-semibold text-destructive">{metrics.summary.rejectedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-sm font-semibold text-foreground">{metrics.monthlyTrend[metrics.monthlyTrend.length - 1]?.submitted || 0}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

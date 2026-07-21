"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getMetrics, type MetricsData } from "@/lib/api/metrics";
import { MetricCard } from "@/components/app/metric-card";
import { SkeletonCard } from "@/components/app/skeleton-rows";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, CheckCircle2, Clock, TrendingUp, XCircle, Eye, HelpCircle, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ["hsl(220, 70%, 45%)", "hsl(170, 60%, 45%)", "hsl(45, 80%, 55%)", "hsl(350, 65%, 50%)"];

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHowModal, setShowHowModal] = useState(false);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch {
      toast.error("Failed to load metrics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Personal Metrics</h1>
          <p className="text-sm text-muted-foreground">Loading your automation dashboard...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Personal Metrics</h1>
          <p className="text-sm text-muted-foreground">Your automation performance and value dashboard</p>
        </div>
        <Card className="border border-border">
          <CardContent className="p-0">
            <EmptyState
              icon={<BarChart3 className="h-8 w-8" />}
              title="No metrics data available"
              description="Start processing documents to see your performance metrics and automation insights."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Personal Metrics</h1>
          <p className="text-sm text-muted-foreground">Your automation performance and value dashboard</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1 w-fit" onClick={() => setShowHowModal(true)}>
          <HelpCircle className="h-4 w-4" /> How it{"'"}s calculated
        </Button>
      </div>

      {/* KPI Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Documents"
          value={metrics.summary.totalDocuments}
          subtitle="All time submissions"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          title="Auto-Approved"
          value={`${metrics.summary.autoApprovalRate}%`}
          subtitle={`${metrics.summary.autoApproved} of ${metrics.summary.totalDocuments}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={{ value: 5, label: "vs last month" }}
        />
        <MetricCard
          title="Avg Turnaround"
          value={`${metrics.summary.avgTurnaroundHours}h`}
          subtitle="Average processing time"
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: -8, label: "faster" }}
        />
        <MetricCard
          title="Time Saved"
          value={`${metrics.summary.timeSavedHours}h`}
          subtitle="Hours saved by automation"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 15, label: "vs last month" }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="autoApproved" name="Auto-Approved" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="manual" name="Manual Review" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By Type */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Documents by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.byType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}
                  >
                    {metrics.byType.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Turnaround Distribution */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Turnaround Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.turnaroundDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" name="Workflows" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">AI Confidence Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.confidenceDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" name="Documents" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Pending Review"
          value={metrics.summary.pendingReview}
          subtitle="Awaiting action"
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          title="Rejected"
          value={metrics.summary.rejectedCount}
          subtitle="All time rejections"
          icon={<XCircle className="h-5 w-5" />}
        />
        <MetricCard
          title="This Month"
          value={metrics.monthlyTrend[metrics.monthlyTrend.length - 1]?.submitted || 0}
          subtitle="Submissions in March 2026"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      {/* How It's Calculated Modal */}
      <Dialog open={showHowModal} onOpenChange={setShowHowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How Metrics Are Calculated</DialogTitle>
            <DialogDescription>Understanding your personal automation metrics</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Auto-Approval Rate</p>
              <p>Percentage of documents that were automatically approved without manual intervention. Calculated as: (Auto-approved / Total documents) x 100</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Average Turnaround</p>
              <p>Mean time from document submission to final approval or rejection, measured in hours.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Time Saved</p>
              <p>Estimated based on industry average manual processing time (45 min/document) minus actual AI-assisted processing time. Cumulative across all documents.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Confidence Scores</p>
              <p>AI model confidence in extracted field accuracy. Green (90%+) = high, Amber (80-89%) = moderate, Red (below 80%) = needs review.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

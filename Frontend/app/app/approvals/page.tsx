"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApprovals } from "@/lib/api/approvals";
import { approveWorkflow, type Workflow } from "@/lib/api/workflows";
import { StatusBadge } from "@/components/app/status-badge";
import { ConfidenceBar } from "@/components/app/confidence-bar";
import { AIResultPreview } from "@/components/app/ai-result-preview";
import { ApprovalPanel } from "@/components/app/approval-panel";
import { ApprovalFlowTimeline } from "@/components/app/approval-flow-timeline";
import { EmptyState } from "@/components/app/empty-state";
import { SkeletonCard } from "@/components/app/skeleton-rows";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Workflow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovals();
      setApprovals(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch {
      toast.error("Failed to load approvals");
    } finally {
      setIsLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  const selectedWorkflow = approvals.find((a) => a.id === selectedId);

  const handleApprove = async (comment: string) => {
    if (!selectedId) return;
    await approveWorkflow(selectedId, "approve", comment);
    loadApprovals();
  };

  const handleReject = async (comment: string) => {
    if (!selectedId) return;
    await approveWorkflow(selectedId, "reject", comment);
    loadApprovals();
  };

  const handleRequestChanges = async (comment: string) => {
    if (!selectedId) return;
    await approveWorkflow(selectedId, "request_changes", comment);
    loadApprovals();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Approvals Queue</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve assigned workflows ({approvals.length} pending)
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="lg:col-span-2 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : approvals.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-8 w-8" />}
          title="No pending approvals"
          description="All caught up! There are no workflows waiting for your review."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Approval List */}
          <div className="space-y-2">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-2 pr-2">
                {approvals.map((wf) => {
                  const isSelected = wf.id === selectedId;
                  const hasLowConfidence = wf.aiResult && wf.aiResult.confidence < 0.8;
                  return (
                    <button
                      key={wf.id}
                      onClick={() => setSelectedId(wf.id)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-muted/50"
                      )}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 overflow-hidden">
                          <p className="truncate text-sm font-medium text-foreground">{wf.id}</p>
                          <p className="text-xs text-muted-foreground capitalize">{wf.type} &middot; {wf.submitter?.name}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(wf.submittedAt ?? new Date()), "MMM d, h:mm a")}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={wf.status ?? "unknown"} />
                          {hasLowConfidence && (
                            <Badge variant="outline" className="text-[10px] border-destructive/25 text-destructive gap-0.5">
                              <AlertTriangle className="h-2.5 w-2.5" /> Low
                            </Badge>
                          )}
                        </div>
                      </div>
                      {wf.aiResult && (
                        <div className="mt-2">
                          <ConfidenceBar confidence={wf.aiResult.confidence} className="text-[10px]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Detail Panel */}
          <div className="space-y-4 lg:col-span-2">
            {selectedWorkflow ? (
              <>
                {/* Workflow Summary */}
                <Card className="border border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">{selectedWorkflow.id}</CardTitle>
                        <StatusBadge status={selectedWorkflow.status ?? "unknown"} />
                      </div>
                      <Link href={`/app/workflows/${selectedWorkflow.id}`} className="text-xs text-primary hover:underline">
                        Full Details
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-medium capitalize text-foreground">{selectedWorkflow.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submitter</p>
                        <p className="font-medium text-foreground">{selectedWorkflow.submitter?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="font-medium text-foreground">
                          {format(new Date(selectedWorkflow.submittedAt ?? new Date()), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Result */}
                {selectedWorkflow.aiResult && (
                  <AIResultPreview aiResult={selectedWorkflow.aiResult} editable={false} />
                )}

                {/* Approval Actions */}
                <ApprovalPanel
                  workflowId={selectedWorkflow.id}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRequestChanges={handleRequestChanges}
                />

                {/* Timeline */}
                <Card className="border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ApprovalFlowTimeline history={selectedWorkflow.history ?? []} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                Select an item from the list to review
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

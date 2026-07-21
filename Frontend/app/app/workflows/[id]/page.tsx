"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorkflowById, approveWorkflow, submitWorkflow, type Workflow } from "@/lib/api/workflows";
import { useAuth } from "@/lib/context/auth-context";
import { AIResultPreview } from "@/components/app/ai-result-preview";
import { ApprovalPanel } from "@/components/app/approval-panel";
import { ApprovalFlowTimeline } from "@/components/app/approval-flow-timeline";
import { StatusBadge } from "@/components/app/status-badge";
import { ConfidenceBar } from "@/components/app/confidence-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, FileText, Download, Clock } from "lucide-react";
import Link from "next/link";

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflow = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const wf = await getWorkflowById(id);
      setWorkflow(wf);
    } catch {
      setError("Workflow not found");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadWorkflow(); }, [loadWorkflow]);

  const handleAccept = async () => {
    if (!workflow) return;
    try {
      await submitWorkflow(workflow.id, {});
      toast.success("Workflow auto-committed successfully");
      loadWorkflow();
    } catch {
      toast.error("Failed to commit workflow");
    }
  };

  const handleSendForReview = async () => {
    if (!workflow) return;
    try {
      await submitWorkflow(workflow.id, {});
      toast.success("Sent for manual review");
      loadWorkflow();
    } catch {
      toast.error("Failed to send for review");
    }
  };

  const handleApprove = async (comment: string) => {
    if (!workflow) return;
    await approveWorkflow(workflow.id, "approve", comment);
    loadWorkflow();
  };

  const handleReject = async (comment: string) => {
    if (!workflow) return;
    await approveWorkflow(workflow.id, "reject", comment);
    loadWorkflow();
  };

  const handleRequestChanges = async (comment: string) => {
    if (!workflow) return;
    await approveWorkflow(workflow.id, "request_changes", comment);
    loadWorkflow();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-sm text-destructive">{error || "Workflow not found"}</p>
        <Button variant="outline" onClick={() => router.push("/app/workflows")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workflows
        </Button>
      </div>
    );
  }

  const isApprover = user?.role === "approver" || user?.role === "admin";
  const canApprove = isApprover && workflow.status && ["AI_PROCESSED", "UNDER_REVIEW"].includes(workflow.status);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/workflows"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{workflow.id}</h1>
              {workflow.status && <StatusBadge status={workflow.status} />}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="capitalize">{workflow.type}</span> &middot; Submitted by {workflow.submitter?.name || "Unknown"} &middot;{" "}
              {workflow.submittedAt && format(new Date(workflow.submittedAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Document Info */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Document Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Workflow ID</p>
                  <p className="text-sm font-medium text-foreground">{workflow.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Document Type</p>
                  <p className="text-sm font-medium capitalize text-foreground">{workflow.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitter</p>
                  <p className="text-sm font-medium text-foreground">{workflow.submitter?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="text-sm font-medium text-foreground">{workflow.assignedTo?.name || "Unassigned"}</p>
                </div>
              </div>

              {/* Attachments */}
              {workflow.attachments && workflow.attachments.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attachments</p>
                  <div className="space-y-2">
                    {workflow.attachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                        <FileText className="h-5 w-5 shrink-0 text-primary" />
                        <span className="flex-1 truncate text-sm text-foreground">{att.name}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Download ${att.name}`}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs: AI Result + Audit Logs */}
          <Tabs defaultValue="ai-result" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="ai-result">AI Result</TabsTrigger>
              <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="ai-result" className="mt-4">
              {workflow.aiResult ? (
                <AIResultPreview
                  aiResult={workflow.aiResult}
                  onAccept={handleAccept}
                  onSendForReview={handleSendForReview}
                  editable={workflow.status === "AI_PROCESSED"}
                />
              ) : (
                <Card className="border border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">AI Processing Pending</p>
                    <p className="text-xs text-muted-foreground">Results will appear once processing is complete</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="audit-logs" className="mt-4">
              <Card className="border border-border">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Action</TableHead>
                        <TableHead className="text-xs">Actor</TableHead>
                        <TableHead className="text-xs">Timestamp</TableHead>
                        <TableHead className="text-xs">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workflow.history && workflow.history.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{log.actor}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {log.timestamp && format(new Date(log.timestamp), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Workflow Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalFlowTimeline history={workflow.history || []} />
            </CardContent>
          </Card>

          {/* Approval Panel (if applicable) */}
          {canApprove && (
            <ApprovalPanel
              workflowId={workflow.id}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
            />
          )}

          {/* AI Confidence Summary */}
          {workflow.aiResult && (
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Confidence Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Overall Confidence</p>
                  <ConfidenceBar confidence={workflow.aiResult.confidence} />
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    {workflow.aiResult.confidence >= 0.9
                      ? "High confidence - eligible for auto-approval"
                      : workflow.aiResult.confidence >= 0.8
                      ? "Moderate confidence - manual review recommended"
                      : "Low confidence - manual review required"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

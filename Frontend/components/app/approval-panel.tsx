"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmationModal } from "@/components/app/confirmation-modal";
import { CheckCircle2, XCircle, RotateCcw, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface ApprovalPanelProps {
  workflowId: string;
  onApprove: (comment: string) => Promise<void>;
  onReject: (comment: string) => Promise<void>;
  onRequestChanges: (comment: string) => Promise<void>;
}

export function ApprovalPanel({ workflowId, onApprove, onReject, onRequestChanges }: ApprovalPanelProps) {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "request_changes" | null>(null);

  const handleAction = async () => {
    if (!confirmAction) return;
    setIsLoading(true);
    try {
      switch (confirmAction) {
        case "approve":
          await onApprove(comment);
          toast.success("Workflow approved successfully");
          break;
        case "reject":
          await onReject(comment);
          toast.success("Workflow rejected");
          break;
        case "request_changes":
          await onRequestChanges(comment);
          toast.success("Changes requested");
          break;
      }
      setComment("");
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  const confirmMessages = {
    approve: { title: "Approve Workflow", desc: `Are you sure you want to approve workflow ${workflowId}?` },
    reject: { title: "Reject Workflow", desc: `Are you sure you want to reject workflow ${workflowId}? This action may require re-submission.` },
    request_changes: { title: "Request Changes", desc: `Request changes for workflow ${workflowId}? The submitter will be notified.` },
  };

  return (
    <>
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Approval Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approval-comment" className="text-xs">Comment</Label>
            <Textarea
              id="approval-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your review comments..."
              className="min-h-80px text-sm"
            />
          </div>

          {/* Stub: File Attachment */}
          <Button variant="outline" size="sm" className="gap-1 text-xs text-muted-foreground" disabled>
            <Paperclip className="h-3 w-3" /> Attach File (Coming Soon)
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setConfirmAction("approve")}
              className="gap-1 bg-success text-success-foreground hover:bg-success/90"
            >
              <CheckCircle2 className="h-3 w-3" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction("request_changes")}
              className="gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Request Changes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction("reject")}
              className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <XCircle className="h-3 w-3" /> Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      {confirmAction && (
        <ConfirmationModal
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={confirmMessages[confirmAction].title}
          description={confirmMessages[confirmAction].desc}
          confirmLabel={confirmMessages[confirmAction].title}
          variant={confirmAction === "reject" ? "destructive" : "default"}
          onConfirm={handleAction}
          isLoading={isLoading}
        />
      )}
    </>
  );
}

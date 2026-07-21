"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FileText, Bot, Eye, CheckCircle2, XCircle, Send, Clock } from "lucide-react";

interface TimelineEntry {
  state: string;
  timestamp: string;
  actor: string;
}

interface ApprovalFlowTimelineProps {
  history: TimelineEntry[];
  className?: string;
}

const STATE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  NEW: { icon: FileText, color: "text-muted-foreground bg-muted", label: "Submitted" },
  AI_PROCESSING: { icon: Bot, color: "text-accent bg-accent/10", label: "AI Processing" },
  AI_PROCESSED: { icon: Bot, color: "text-chart-2 bg-chart-2/10", label: "AI Processed" },
  UNDER_REVIEW: { icon: Eye, color: "text-warning-foreground bg-warning/15", label: "Under Review" },
  APPROVED: { icon: CheckCircle2, color: "text-success bg-success/10", label: "Approved" },
  REJECTED: { icon: XCircle, color: "text-destructive bg-destructive/10", label: "Rejected" },
  SENT_FOR_REVIEW: { icon: Send, color: "text-warning-foreground bg-warning/15", label: "Sent for Review" },
};

export function ApprovalFlowTimeline({ history, className }: ApprovalFlowTimelineProps) {
  return (
    <div className={cn("space-y-0", className)} role="list" aria-label="Workflow timeline">
      {history.map((entry, idx) => {
        const config = STATE_CONFIG[entry.state] || { icon: Clock, color: "text-muted-foreground bg-muted", label: entry.state };
        const Icon = config.icon;
        const isLast = idx === history.length - 1;

        return (
          <div key={`${entry.state}-${idx}`} className="flex gap-3" role="listitem">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>

            {/* Content */}
            <div className={cn("pb-6", isLast ? "pb-0" : "")}>
              <p className="text-sm font-medium text-foreground">{config.label}</p>
              <p className="text-xs text-muted-foreground">
                by {entry.actor} &middot; {format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

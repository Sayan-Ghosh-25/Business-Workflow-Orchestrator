"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-muted text-muted-foreground border-muted" },
  AI_PROCESSING: { label: "AI Processing", className: "bg-accent/20 text-accent border-accent/30" },
  AI_PROCESSED: { label: "AI Processed", className: "bg-chart-2/15 text-chart-2 border-chart-2/25" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-warning/15 text-warning-foreground border-warning/25" },
  APPROVED: { label: "Approved", className: "bg-success/15 text-success border-success/25" },
  REJECTED: { label: "Rejected", className: "bg-destructive/15 text-destructive border-destructive/25" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-muted text-muted-foreground border-muted" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}

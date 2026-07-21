"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  confidence: number; // 0-1
  showLabel?: boolean;
  className?: string;
}

/**
 * Confidence color coding:
 * >= 90% green, 80-90% amber, < 80% red
 */
function getConfidenceColor(confidence: number): string {
  const pct = confidence * 100;
  if (pct >= 90) return "text-success";
  if (pct >= 80) return "text-warning-foreground";
  return "text-destructive";
}

function getProgressColor(confidence: number): string {
  const pct = confidence * 100;
  if (pct >= 90) return "[&>[data-slot=progress-indicator]]:bg-success";
  if (pct >= 80) return "[&>[data-slot=progress-indicator]]:bg-warning";
  return "[&>[data-slot=progress-indicator]]:bg-destructive";
}

export function ConfidenceBar({ confidence, showLabel = true, className }: ConfidenceBarProps) {
  const pct = Math.round(confidence * 100);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress
        value={pct}
        className={cn("h-2 flex-1", getProgressColor(confidence))}
        aria-label={`Confidence: ${pct}%`}
      />
      {showLabel && (
        <span className={cn("min-w-3rem text-right text-xs font-semibold", getConfidenceColor(confidence))}>
          {pct}%
        </span>
      )}
    </div>
  );
}

export { getConfidenceColor };

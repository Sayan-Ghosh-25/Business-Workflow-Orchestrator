"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonRowsProps {
  rows?: number;
  columns?: number;
}

export function SkeletonRows({ rows = 5, columns = 5 }: SkeletonRowsProps) {
  return (
    <div className="space-y-3" aria-label="Loading content" role="status">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 rounded-lg border border-border p-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border p-5 space-y-3" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function DataPagination({ page, pageSize, total, onPageChange }: DataPaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs text-muted-foreground">
        Showing {start}-{end} of {total} results
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 text-xs"
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAuditLogs, type AuditLog, type AuditFilters } from "@/lib/api/audit";
import { SearchBar } from "@/components/app/search-bar";
import { FilterChips } from "@/components/app/filter-chips";
import { EmptyState } from "@/components/app/empty-state";
import { SkeletonRows } from "@/components/app/skeleton-rows";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";

const ACTION_OPTIONS = [
  { label: "All", value: "" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "AI Processed", value: "AI_PROCESSED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Sent for Review", value: "SENT_FOR_REVIEW" },
];

const ACTION_COLORS: Record<string, string> = {
  SUBMITTED: "bg-muted text-muted-foreground",
  AI_PROCESSED: "bg-accent/10 text-accent",
  APPROVED: "bg-success/10 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
  SENT_FOR_REVIEW: "bg-warning/10 text-warning-foreground",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters & { q?: string; action?: string }>({});

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs(filters);
      let filtered = data;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.workflowId?.toLowerCase().includes(q) ||
            l.actor?.name?.toLowerCase().includes(q) ||
            l.details?.toLowerCase().includes(q)
        );
      }
      setLogs(filtered);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Audit Trail</h1>
        <p className="text-sm text-muted-foreground">Complete audit log of all workflow actions</p>
      </div>

      {/* Filters */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <SearchBar
                value={filters.q || ""}
                onChange={(q) => setFilters((f) => ({ ...f, q }))}
                placeholder="Search by workflow ID, actor, or details..."
              />
            </div>
            <FilterChips
              label="Action"
              options={ACTION_OPTIONS}
              selected={filters.action || ""}
              onChange={(action) => setFilters((f) => ({ ...f, action }))}
            />
            <div className="flex gap-3">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filters.from || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filters.to || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className="border border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4"><SkeletonRows rows={8} columns={5} /></div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-8 w-8" />}
              title="No audit logs found"
              description="Try adjusting your filters or date range."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Timestamp</TableHead>
                    <TableHead className="text-xs">Workflow ID</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Actor</TableHead>
                    <TableHead className="text-xs">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {log.timestamp && format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>
                        <Link href={`/app/workflows/${log.workflowId}`} className="text-sm font-medium text-primary hover:underline">
                          {log.workflowId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${log.action ? ACTION_COLORS[log.action] || "" : ""}`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{log.actor?.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

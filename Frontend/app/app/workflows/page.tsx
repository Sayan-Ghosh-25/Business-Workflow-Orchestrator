"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getWorkflows, createWorkflow, withdrawWorkflow, type Workflow, type WorkflowFilters } from "@/lib/api/workflows";
import { StatusBadge } from "@/components/app/status-badge";
import { SearchBar } from "@/components/app/search-bar";
import { FilterChips } from "@/components/app/filter-chips";
import { DataPagination } from "@/components/app/data-pagination";
import { FileUpload } from "@/components/app/file-upload";
import { EmptyState } from "@/components/app/empty-state";
import { ConfirmationModal } from "@/components/app/confirmation-modal";
import { SkeletonRows } from "@/components/app/skeleton-rows";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, Plus, Eye, XCircle, Upload, Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "New", value: "NEW" },
  { label: "AI Processed", value: "AI_PROCESSED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const TYPE_OPTIONS = [
  { label: "All", value: "" },
  { label: "Invoice", value: "invoice" },
  { label: "Resume", value: "resume" },
  { label: "Contract", value: "contract" },
  { label: "Form", value: "form" },
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<WorkflowFilters>({ status: "", type: "", q: "", page: 1, pageSize: 10 });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState("invoice");
  const [projectId, setProjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getWorkflows(filters);
      setWorkflows(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load workflows");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadWorkflows(); }, [loadWorkflows]);

  const handleUploadSubmit = async () => {
    if (!selectedFile) { toast.error("Please select a file"); return; }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile, selectedFile.name);
      fd.append("type", uploadType);
      if (projectId) fd.append("metadata", JSON.stringify({ projectId }));
  
      const res = await createWorkflow(fd);
      toast.success(`Workflow ${res.id} created successfully`);
      setShowUploadDialog(false);
      setSelectedFile(null);
      setProjectId("");
      loadWorkflows();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create workflow");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawId) return;
    try {
      await withdrawWorkflow(withdrawId);
      toast.success(`Workflow ${withdrawId} withdrawn`);
      setWithdrawId(null);
      loadWorkflows();
    } catch {
      toast.error("Failed to withdraw workflow");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground">Manage your document processing workflows</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} className="gap-2 w-fit">
          <Plus className="h-4 w-4" /> New Workflow
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <SearchBar
                value={filters.q || ""}
                onChange={(q) => setFilters((f) => ({ ...f, q, page: 1 }))}
                placeholder="Search by ID, submitter, or type..."
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <FilterChips
                label="Status"
                options={STATUS_OPTIONS}
                selected={filters.status || ""}
                onChange={(status) => setFilters((f) => ({ ...f, status, page: 1 }))}
              />
              <FilterChips
                label="Type"
                options={TYPE_OPTIONS}
                selected={filters.type || ""}
                onChange={(type) => setFilters((f) => ({ ...f, type, page: 1 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Table */}
      <Card className="border border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4"><SkeletonRows rows={5} columns={6} /></div>
          ) : workflows.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No workflows found"
              description="Upload your first document to start processing, or adjust your filters."
              action={
                <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
                  <Upload className="h-4 w-4" /> Upload Document
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Workflow ID</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Submitter</TableHead>
                      <TableHead className="text-xs">Submitted</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Assigned To</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflows.map((wf) => (
                      <TableRow key={wf.id} className="group">
                        <TableCell className="text-sm font-medium text-primary">
                          <Link href={`/app/workflows/${wf.id}`} className="hover:underline">{wf.id}</Link>
                        </TableCell>
                        <TableCell className="text-sm capitalize text-foreground">{wf.type}</TableCell>
                        <TableCell className="text-sm text-foreground">{wf.submitter?.name || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{wf.submittedAt ? format(new Date(wf.submittedAt), "MMM d, h:mm a") : "—"}</TableCell>
                        <TableCell><StatusBadge status={wf.status || "NEW"} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{wf.assignedTo?.name || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild aria-label={`View ${wf.id}`}>
                              <Link href={`/app/workflows/${wf.id}`}><Eye className="h-4 w-4" /></Link>
                            </Button>
                            {(wf.status === "NEW" || wf.status === "AI_PROCESSED") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setWithdrawId(wf.id)}
                                aria-label={`Withdraw ${wf.id}`}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="border-t border-border px-4">
                <DataPagination
                  page={filters.page || 1}
                  pageSize={filters.pageSize || 10}
                  total={total}
                  onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Submit a document for AI processing and workflow routing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project / Employee ID (Optional)</Label>
              <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="e.g., PROJ-001 or EMP-4521" />
            </div>
            <FileUpload onFileSelect={(f) => setSelectedFile(f)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button onClick={handleUploadSubmit} disabled={isSubmitting || !selectedFile} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Submit for Processing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation */}
      <ConfirmationModal
        open={!!withdrawId}
        onOpenChange={(open) => !open && setWithdrawId(null)}
        title="Withdraw Workflow"
        description={`Are you sure you want to withdraw workflow ${withdrawId}? This action cannot be undone.`}
        confirmLabel="Withdraw"
        variant="destructive"
        onConfirm={handleWithdraw}
      />
    </div>
  );
}

"use client";

import React, { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import apiClient from "@/lib/api/client";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  autoUpload?: boolean;
  extraFields?: Record<string, any>;
}

export function FileUpload({
  onFileSelect,
  accept = ".pdf",
  maxSizeMB = 2,
  className,
  autoUpload = false,
  extraFields = {},
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const simIntervalRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearSimInterval = () => {
    if (simIntervalRef.current) {
      window.clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  };

  const startSimulatedProgress = () => {
    clearSimInterval();
    setUploadProgress(0);
    simIntervalRef.current = window.setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearSimInterval();
          return 100;
        }
        return Math.min(100, prev + 20);
      });
    }, 200);
  };

  const uploadToServer = async (file: File) => {
    try {
      const form = new FormData();
      form.append("file", file);
      Object.entries(extraFields || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, typeof v === "string" ? v : JSON.stringify(v));
      });

      abortControllerRef.current = new AbortController();

      const res = await apiClient.post("/workflows", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (ev.total) {
            clearSimInterval();
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setUploadProgress(pct);
          }
        },
        signal: abortControllerRef.current.signal as any,
      });

      setUploadProgress(100);
      clearSimInterval();
      return res.data;
    } catch (err) {
      console.error("uploadToServer failed", err);
      setError("Upload failed. Please try again.");
      clearSimInterval();
      return null;
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size must be under ${maxSizeMB}MB`);
        return;
      }
      setSelectedFile(file);

      try {
        onFileSelect(file);
      } catch (err) {
        console.warn("onFileSelect threw", err);
      }
      startSimulatedProgress();

      if (autoUpload) {
        uploadToServer(file).then((created) => {
          // you may optionally notify parent
          // console.log("Upload created workflow:", created);
        });
      }
    },
    [onFileSelect, maxSizeMB, autoUpload, extraFields]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    if (abortControllerRef.current) abortControllerRef.current.abort();
    clearSimInterval();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          error ? "border-destructive" : ""
        )}
        role="button"
        aria-label="Upload file"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <Upload className={cn("h-8 w-8", dragOver ? "text-primary" : "text-muted-foreground")} />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{dragOver ? "Drop your file here" : "Click or drag to upload"}</p>
          <p className="text-xs text-muted-foreground">PDF files up to {maxSizeMB}MB</p>
        </div>
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="sr-only" aria-label="File input" />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {selectedFile && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <FileText className="h-8 w-8 shrink-0 text-primary" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            {uploadProgress < 100 && <Progress value={uploadProgress} className="h-1.5" />}
            {uploadProgress >= 100 && <p className="text-xs text-success font-medium">Upload complete</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBar, getConfidenceColor } from "@/components/app/confidence-bar";
import { cn } from "@/lib/utils";
import { Bot, Check, Edit3, Send, Eye, EyeOff } from "lucide-react";
import type { AIResult } from "@/lib/api/workflows";

interface AIResultPreviewProps {
  aiResult: AIResult;
  onAccept?: () => void;
  onEdit?: (editedFields: Record<string, string | number>) => void;
  onSendForReview?: () => void;
  editable?: boolean;
}

export function AIResultPreview({
  aiResult,
  onAccept,
  onEdit,
  onSendForReview,
  editable = true,
}: AIResultPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string | number>>({ ...aiResult.fields });
  const [showRawJSON, setShowRawJSON] = useState(false);

  const confidenceThreshold = 0.85;

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditSubmit = () => {
    onEdit?.(editedFields);
    setIsEditing(false);
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Bot className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">AI Extraction Result</CardTitle>
              <p className="text-xs text-muted-foreground">
                Type: <span className="capitalize font-medium text-foreground">{aiResult.resultType}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Overall confidence */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overall Confidence</span>
            {aiResult.confidence < confidenceThreshold && (
              <Badge variant="outline" className="text-[10px] border-destructive/25 text-destructive bg-destructive/10">
                Below threshold ({Math.round(confidenceThreshold * 100)}%)
              </Badge>
            )}
          </div>
          <ConfidenceBar confidence={aiResult.confidence} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Raw JSON toggle */}
        {showRawJSON && (
          <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            {JSON.stringify(aiResult, null, 2)}
          </pre>
        )}

        {/* Extracted Fields */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extracted Fields</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(aiResult.fields).map(([key, value]) => {
              const isEdited = editedFields[key] !== aiResult.fields[key];
              const isLowConfidence = aiResult.confidence < 0.8;
              return (
                <div key={key} className="space-y-1">
                  <Label className={cn("text-xs capitalize", isLowConfidence ? "text-destructive" : "text-muted-foreground")}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                    {isLowConfidence && <span className="ml-1 text-[10px]">(low confidence)</span>}
                  </Label>
                  {isEditing ? (
                    <div className="space-y-0.5">
                      <Input
                        value={String(editedFields[key] ?? "")}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className={cn("h-8 text-sm", isEdited ? "border-warning" : "")}
                      />
                      {isEdited && (
                        <p className="text-[10px] text-muted-foreground">
                          Original: <span className="line-through">{String(value)}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className={cn("text-sm font-medium text-foreground", isLowConfidence ? "text-destructive" : "")}>
                      {typeof value === "number" && aiResult.fields.currency === "INR"
                        ? `₹${value.toLocaleString("en-IN")}`
                        : String(value)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {editable && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {!isEditing ? (
              <>
                <Button size="sm" onClick={onAccept} className="gap-1">
                  <Check className="h-3 w-3" /> Accept (Auto-commit)
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-1">
                  <Edit3 className="h-3 w-3" /> Edit & Submit
                </Button>
                <Button size="sm" variant="secondary" onClick={onSendForReview} className="gap-1">
                  <Send className="h-3 w-3" /> Send for Manual Review
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={handleEditSubmit} className="gap-1">
                  <Check className="h-3 w-3" /> Save & Submit
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsEditing(false);
                  setEditedFields({ ...aiResult.fields });
                }}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

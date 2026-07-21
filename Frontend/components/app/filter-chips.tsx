"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  label: string;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
}

export function FilterChips({ label, options, selected, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={selected === opt.value ? "default" : "outline"}
          size="sm"
          className={cn("h-7 text-xs", selected === opt.value ? "" : "text-muted-foreground")}
          onClick={() => onChange(selected === opt.value ? "" : opt.value)}
          aria-pressed={selected === opt.value}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

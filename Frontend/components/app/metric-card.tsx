"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("border border-border", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p className={cn("text-xs font-medium", trend.value >= 0 ? "text-success" : "text-destructive")}>
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

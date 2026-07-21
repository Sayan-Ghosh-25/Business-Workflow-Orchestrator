"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, FileText, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import apiClient from "@/lib/api/client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  timestamp: string;
  read?: boolean;
  workflowId?: string;
}

interface NotificationsDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconMap: Record<string, React.ElementType> = {
  review_required: AlertTriangle,
  approved: CheckCircle2,
  ai_complete: FileText,
  rejected: XCircle,
};

const colorMap: Record<string, string> = {
  review_required: "text-warning",
  approved: "text-success",
  ai_complete: "text-accent",
  rejected: "text-destructive",
};

function normalizeNotification(raw: any): Notification {
  return {
    id: raw.id ?? raw.notification_id ?? String(raw._id ?? raw.key ?? ""),
    type: raw.type ?? raw.kind ?? "ai_complete",
    title: raw.title ?? raw.subject ?? raw.notificationTitle ?? "",
    message: raw.message ?? raw.body ?? raw.text ?? raw.content ?? "",
    timestamp: raw.createdAt ?? raw.timestamp ?? raw.created_at ?? new Date().toISOString(),
    read: raw.read ?? raw.is_read ?? false,
    workflowId: raw.workflowId ?? raw.workflow_id ?? raw.payload?.workflowId ?? raw.payload?.workflow_id ?? undefined,
  };
}

export function NotificationsDropdown({ open, onOpenChange }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient.get("/notifications");
        const raw = Array.isArray(res.data) ? res.data : res.data.items ?? [];
        const list = raw.map(normalizeNotification);
        if (mounted) setNotifications(list);
      } catch (err) {
        console.error("Failed to load notifications", err);
        if (mounted) setNotifications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try {
      await apiClient.post(`/notifications/${encodeURIComponent(id)}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("Failed mark read", err);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unreadCount} unread)`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications to check</div>
          ) : (
            notifications.map((n) => {
              const Icon = iconMap[n.type] || FileText;
              const color = colorMap[n.type] || "text-muted-foreground";
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-muted/50 ${!n.read ? "bg-accent/10" : ""}`}
                >
                  <div className={`mt-0.5 shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs ${!n.read ? "font-semibold text-foreground" : "text-foreground"}`}>{n.title}</p>
                      <div className="text-[10px] text-muted-foreground/70 whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <div className="mt-2 flex gap-2">
                      {n.workflowId && (
                        <Link href={`/app/workflows/${n.workflowId}`} onClick={() => onOpenChange(false)} className="text-xs text-primary pt-2.5">
                          View Workflow
                        </Link>
                      )}
                      {!n.read && (
                        <Button className="text-xs" variant="link" onClick={() => markRead(n.id)}>
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

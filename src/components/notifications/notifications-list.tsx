"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  FileText,
  Truck,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

interface NotificationsListProps {
  notifications: Notification[];
}

const typeIcons: Record<string, typeof Bell> = {
  case_status: Package,
  invoice_issued: FileText,
  invoice_reminder: FileText,
  shipment_delivered: Truck,
};

const typeColors: Record<string, string> = {
  case_status: "bg-blue-500/10 text-blue-500",
  invoice_issued: "bg-amber-500/10 text-amber-500",
  invoice_reminder: "bg-red-500/10 text-red-500",
  shipment_delivered: "bg-green-500/10 text-green-500",
};

type FilterType = "all" | "unread" | "case_status" | "invoice" | "shipment";

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterType>("all");

  const supabase = createClient();

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    if (filter === "case_status") return n.type === "case_status";
    if (filter === "invoice")
      return n.type === "invoice_issued" || n.type === "invoice_reminder";
    if (filter === "shipment") return n.type === "shipment_delivered";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to mark notification as read");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (error) {
      toast.error("Failed to mark all notifications as read");
      return;
    }

    toast.success("All notifications marked as read");
    startTransition(() => {
      router.refresh();
    });
  }

  async function deleteNotification(id: string) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete notification");
      return;
    }

    toast.success("Notification deleted");
    startTransition(() => {
      router.refresh();
    });
  }

  async function clearAllRead() {
    const readIds = notifications.filter((n) => n.is_read).map((n) => n.id);
    if (readIds.length === 0) {
      toast.info("No read notifications to clear");
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .in("id", readIds);

    if (error) {
      toast.error("Failed to clear read notifications");
      return;
    }

    toast.success("Cleared all read notifications");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {filter === "all" && "All Notifications"}
                {filter === "unread" && "Unread"}
                {filter === "case_status" && "Cases"}
                {filter === "invoice" && "Invoices"}
                {filter === "shipment" && "Shipments"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")}>
                Unread ({unreadCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("case_status")}>
                Cases
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("invoice")}>
                Invoices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("shipment")}>
                Shipments
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllRead}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear read
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No notifications</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {filter === "all"
                ? "You're all caught up!"
                : "No notifications match this filter"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            const colorClass = typeColors[notification.type] || "bg-muted text-muted-foreground";

            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors",
                  !notification.is_read && "bg-primary/5 border-primary/20"
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                      colorClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={cn(
                            "font-medium",
                            !notification.is_read && "text-foreground",
                            notification.is_read && "text-muted-foreground"
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.created_at &&
                            formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification.id)}
                            disabled={isPending}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteNotification(notification.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}



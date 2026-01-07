"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

interface UseRealtimeNotificationsOptions {
  practiceId: string | undefined;
  enabled?: boolean;
}

export function useRealtimeNotifications({
  practiceId,
  enabled = true,
}: UseRealtimeNotificationsOptions) {
  const router = useRouter();
  const supabase = createClient();

  const handleNewNotification = useCallback(
    (notification: Notification) => {
      // Show toast for new notification
      toast.info(notification.title, {
        description: notification.message,
        action: {
          label: "View",
          onClick: () => router.push("/notifications"),
        },
      });

      // Refresh the page to update notification count
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    if (!enabled || !practiceId) return;

    const channel = supabase
      .channel(`notifications:${practiceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `practice_id=eq.${practiceId}`,
        },
        (payload) => {
          handleNewNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, practiceId, enabled, handleNewNotification]);
}



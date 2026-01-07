"use client";

import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

interface RealtimeNotificationsProviderProps {
  practiceId: string | undefined;
  children: React.ReactNode;
}

export function RealtimeNotificationsProvider({
  practiceId,
  children,
}: RealtimeNotificationsProviderProps) {
  useRealtimeNotifications({
    practiceId,
    enabled: !!practiceId,
  });

  return <>{children}</>;
}



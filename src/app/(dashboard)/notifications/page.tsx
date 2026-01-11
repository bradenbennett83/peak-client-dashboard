import { Suspense } from "react";
import { Bell, Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { createClient } from "@/lib/supabase/server";
import { requireUserWithProfile } from "@/lib/auth/get-user";

export default async function NotificationsPage() {
  await requireUserWithProfile();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight font-serif">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your cases, invoices, and shipments
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <Suspense fallback={<NotificationsListSkeleton />}>
        <NotificationsListServer />
      </Suspense>
    </div>
  );
}

async function NotificationsListServer() {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("practice_id", profile?.practice_id)
    .order("created_at", { ascending: false })
    .limit(100);

  return <NotificationsList notifications={notifications || []} />;
}

function NotificationsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}



import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { RealtimeNotificationsProvider } from "@/components/notifications/realtime-notifications-provider";
import { getUserWithProfile } from "@/lib/auth/get-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getUserWithProfile();
  const practiceId = result?.profile?.practice_id;

  return (
    <SidebarProvider>
      <RealtimeNotificationsProvider practiceId={practiceId}>
        <AppSidebar />
        <SidebarInset>
          <AppTopbar />
          <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
            {children}
          </main>
        </SidebarInset>
      </RealtimeNotificationsProvider>
    </SidebarProvider>
  );
}


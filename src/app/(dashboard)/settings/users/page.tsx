import { Suspense } from "react";
import { requireUserWithProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsersList } from "./users-list";
import { InviteUserDialog } from "./invite-user-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default async function UsersSettingsPage() {
  const { profile } = await requireUserWithProfile();

  // Only admins can access this page
  if (profile?.role !== "admin") {
    redirect("/settings");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight font-serif">Team Members</h1>
          <p className="text-muted-foreground">
            Manage users and invitations for your practice
          </p>
        </div>
        <InviteUserDialog />
      </div>

      <Suspense fallback={<UsersListSkeleton />}>
        <UsersListServer practiceId={profile?.practice_id || ""} />
      </Suspense>
    </div>
  );
}

async function UsersListServer({ practiceId }: { practiceId: string }) {
  const supabase = await createClient();

  // Get users
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .eq("practice_id", practiceId)
    .order("created_at", { ascending: false });

  // Get pending invitations
  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("practice_id", practiceId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  return <UsersList users={users || []} invitations={invitations || []} />;
}

function UsersListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}


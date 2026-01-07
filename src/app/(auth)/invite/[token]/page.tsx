import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AcceptInviteForm } from "./accept-invite-form";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  // Verify the invitation token
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(
      `
      *,
      practice:practices(name)
    `
    )
    .eq("token", token)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !invitation) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-semibold">Peak Dental Studio</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            You&apos;ve been invited!
          </h1>
          <p className="text-muted-foreground mt-2">
            Join <span className="font-medium">{invitation.practice?.name}</span>{" "}
            on Peak Dental Studio
          </p>
        </div>

        <AcceptInviteForm
          token={token}
          email={invitation.email}
          practiceName={invitation.practice?.name || ""}
          role={invitation.role}
        />
      </div>
    </div>
  );
}


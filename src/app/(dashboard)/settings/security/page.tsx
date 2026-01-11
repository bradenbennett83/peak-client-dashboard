import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUserWithProfile } from "@/lib/auth/get-user";
import { ChangePasswordForm } from "./change-password-form";

export default async function SecuritySettingsPage() {
  const { user, profile } = await requireUserWithProfile();

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Link>
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight font-serif">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage your password and account security
        </p>
      </div>

      {/* Change Password Form */}
      <ChangePasswordForm userEmail={user?.email} />
    </div>
  );
}



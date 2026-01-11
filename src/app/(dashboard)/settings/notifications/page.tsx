import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUserWithProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { NotificationPreferencesForm } from "./notification-preferences-form";

export default async function NotificationPreferencesPage() {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  const { data: practice } = await supabase
    .from("practices")
    .select("id, settings")
    .eq("id", profile?.practice_id)
    .single();

  // Extract notification preferences from practice settings
  const settings = (practice?.settings as Record<string, unknown>) || {};
  const notificationPrefs = {
    emailCaseUpdates: (settings.emailCaseUpdates as boolean | undefined) ?? true,
    emailInvoices: (settings.emailInvoices as boolean | undefined) ?? true,
    emailShipping: (settings.emailShipping as boolean | undefined) ?? true,
    inAppCaseUpdates: (settings.inAppCaseUpdates as boolean | undefined) ?? true,
    inAppInvoices: (settings.inAppInvoices as boolean | undefined) ?? true,
    inAppShipping: (settings.inAppShipping as boolean | undefined) ?? true,
    digestFrequency: (settings.digestFrequency as string | undefined) || "immediate",
  };

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
        <h1 className="text-3xl font-light tracking-tight font-serif">
          Notification Preferences
        </h1>
        <p className="text-muted-foreground">
          Configure how and when you receive notifications
        </p>
      </div>

      {/* Form */}
      <NotificationPreferencesForm
        practiceId={practice?.id}
        preferences={notificationPrefs}
      />
    </div>
  );
}



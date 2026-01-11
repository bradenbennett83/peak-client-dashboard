import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUserWithProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { PracticeProfileForm } from "./practice-profile-form";

export default async function PracticeProfilePage() {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  const { data: practice } = await supabase
    .from("practices")
    .select("*")
    .eq("id", profile?.practice_id)
    .single();

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
        <h1 className="text-3xl font-light tracking-tight font-serif">Practice Profile</h1>
        <p className="text-muted-foreground">
          Update your practice information and contact details
        </p>
      </div>

      {/* Form */}
      <PracticeProfileForm practice={practice} />
    </div>
  );
}



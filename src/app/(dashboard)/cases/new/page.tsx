import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUserWithProfile } from "@/lib/auth/get-user";
import { NewCaseForm } from "./new-case-form";

export default async function NewCasePage() {
  await requireUserWithProfile();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/cases">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cases
        </Link>
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight font-serif">Submit New Case</h1>
        <p className="text-muted-foreground">
          Fill out the form below to submit a new dental case
        </p>
      </div>

      {/* New Case Form */}
      <NewCaseForm />
    </div>
  );
}


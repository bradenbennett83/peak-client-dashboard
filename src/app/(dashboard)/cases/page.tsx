import { Suspense } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CasesList } from "./cases-list";
import { createClient } from "@/lib/supabase/server";
import { requireUserWithProfile } from "@/lib/auth/get-user";

export default async function CasesPage() {
  await requireUserWithProfile();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight font-serif">Cases</h1>
          <p className="text-muted-foreground">
            View and manage your dental lab cases
          </p>
        </div>
        <Button asChild>
          <Link href="/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            Submit New Case
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cases by patient name, case number..."
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Cases List */}
      <Suspense fallback={<CasesListSkeleton />}>
        <CasesListServer />
      </Suspense>
    </div>
  );
}

async function CasesListServer() {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("practice_id", profile?.practice_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <CasesList cases={cases || []} />;
}

function CasesListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}


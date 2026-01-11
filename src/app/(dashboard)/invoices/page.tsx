import { Suspense } from "react";
import { Search, Filter, DollarSign, AlertCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { InvoicesList } from "./invoices-list";
import { createClient } from "@/lib/supabase/server";
import { requireUserWithProfile } from "@/lib/auth/get-user";

export default async function InvoicesPage() {
  await requireUserWithProfile();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight font-serif">Invoices</h1>
        <p className="text-muted-foreground">
          View and pay your invoices
        </p>
      </div>

      {/* Summary Cards */}
      <Suspense fallback={<SummaryCardsSkeleton />}>
        <InvoiceSummaryCards />
      </Suspense>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices by number, amount..."
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Invoices List */}
      <Suspense fallback={<InvoicesListSkeleton />}>
        <InvoicesListServer />
      </Suspense>
    </div>
  );
}

async function InvoiceSummaryCards() {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount, amount_paid, status, due_date")
    .eq("practice_id", profile?.practice_id);

  const today = new Date();
  let totalOutstanding = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let pendingCount = 0;

  (invoices || []).forEach((inv) => {
    if (inv.status !== "paid") {
      const remaining = (inv.amount || 0) - (inv.amount_paid || 0);
      totalOutstanding += remaining;
      
      if (inv.due_date && new Date(inv.due_date) < today) {
        overdueAmount += remaining;
        overdueCount++;
      } else {
        pendingCount++;
      }
    }
  });

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-semibold">
              ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overdue ({overdueCount})</p>
            <p className="text-2xl font-semibold text-red-600">
              ${overdueAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending ({pendingCount})</p>
            <p className="text-2xl font-semibold">
              {pendingCount} invoices
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function InvoicesListServer() {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("practice_id", profile?.practice_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <InvoicesList invoices={invoices || []} />;
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InvoicesListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      ))}
    </div>
  );
}


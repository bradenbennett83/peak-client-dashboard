import { Suspense } from "react";
import Link from "next/link";
import { Plus, Search, Package, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ShippingLabelsList } from "./shipping-labels-list";
import { createClient } from "@/lib/supabase/server";
import { requireUserWithProfile } from "@/lib/auth/get-user";

export default async function ShippingPage() {
  await requireUserWithProfile();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight font-serif">Shipping</h1>
          <p className="text-muted-foreground">
            Create and manage prepaid shipping labels
          </p>
        </div>
        <Button asChild>
          <Link href="/shipping/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Shipping Label
          </Link>
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Free Prepaid Shipping Labels</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Peak Dental Studio provides free UPS 2-Day shipping labels for all
              inbound cases. Simply create a label, print it, and attach it to
              your package. We cover all shipping costs!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by tracking number..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Shipping Labels List */}
      <Suspense fallback={<ShippingListSkeleton />}>
        <ShippingLabelsServer />
      </Suspense>
    </div>
  );
}

async function ShippingLabelsServer() {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  const { data: labels } = await supabase
    .from("shipping_labels")
    .select("*")
    .eq("practice_id", profile?.practice_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <ShippingLabelsList labels={labels || []} />;
}

function ShippingListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      ))}
    </div>
  );
}


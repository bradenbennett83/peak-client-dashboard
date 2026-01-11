import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUserWithProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getPaymentMethods } from "@/lib/stripe/client";
import { PaymentMethodsList } from "./payment-methods-list";

export default async function PaymentMethodsPage() {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  // Get practice with Stripe customer ID
  const { data: practice } = await supabase
    .from("practices")
    .select("id, name, stripe_customer_id")
    .eq("id", profile?.practice_id)
    .single();

  // Get payment methods from Stripe if customer exists
  let paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>> = [];
  if (practice?.stripe_customer_id) {
    try {
      paymentMethods = await getPaymentMethods(practice.stripe_customer_id);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  }

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
        <h1 className="text-3xl font-light tracking-tight font-serif">Payment Methods</h1>
        <p className="text-muted-foreground">
          Manage your saved payment methods for invoice payments
        </p>
      </div>

      {/* Payment Methods List */}
      <PaymentMethodsList
        paymentMethods={paymentMethods}
        stripeCustomerId={practice?.stripe_customer_id}
        practiceId={practice?.id}
        practiceName={practice?.name}
      />
    </div>
  );
}


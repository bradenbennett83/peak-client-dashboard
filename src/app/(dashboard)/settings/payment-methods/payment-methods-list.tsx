"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MoreVertical, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import type Stripe from "stripe";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AddPaymentMethodDialog } from "./add-payment-method-dialog";

interface PaymentMethodsListProps {
  paymentMethods: Stripe.PaymentMethod[];
  stripeCustomerId: string | null | undefined;
  practiceId: string | undefined;
  practiceName: string | undefined;
}

export function PaymentMethodsList({
  paymentMethods,
  stripeCustomerId,
  practiceId,
  practiceName,
}: PaymentMethodsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddDialog, setShowAddDialog] = useState(false);

  async function handleDetach(paymentMethodId: string) {
    const response = await fetch("/api/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "detach",
        paymentMethodId,
        practiceId,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to remove payment method");
      return;
    }

    toast.success("Payment method removed");
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleSetDefault(paymentMethodId: string) {
    const response = await fetch("/api/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_default",
        paymentMethodId,
        practiceId,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to set default payment method");
      return;
    }

    toast.success("Default payment method updated");
    startTransition(() => {
      router.refresh();
    });
  }

  const getCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
    };
    return brands[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  return (
    <div className="space-y-4">
      {/* Add Payment Method Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {/* Payment Methods */}
      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No payment methods</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Add a payment method to pay invoices
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((pm) => {
            const card = pm.card;
            if (!card) return null;

            return (
              <Card key={pm.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {getCardBrand(card.brand)} •••• {card.last4}
                        </p>
                        {pm.id === stripeCustomerId && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {card.exp_month}/{card.exp_year}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {pm.id !== stripeCustomerId && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(pm.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Set as default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDetach(pm.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        practiceId={practiceId}
        practiceName={practiceName}
      />
    </div>
  );
}


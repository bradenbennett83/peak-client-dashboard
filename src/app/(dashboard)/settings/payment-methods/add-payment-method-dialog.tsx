"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStripe } from "@/lib/stripe/get-stripe";

const stripePromise = getStripe();

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practiceId: string | undefined;
  practiceName: string | undefined;
}

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  practiceId,
  practiceName,
}: AddPaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a credit or debit card for invoice payments
          </DialogDescription>
        </DialogHeader>
        <Elements
          stripe={stripePromise}
          options={{
            mode: "setup",
            currency: "usd",
            setupFutureUsage: "off_session",
          }}
        >
          <AddPaymentMethodForm
            onSuccess={() => onOpenChange(false)}
            practiceId={practiceId}
            practiceName={practiceName}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}

function AddPaymentMethodForm({
  onSuccess,
  practiceId,
  practiceName,
}: {
  onSuccess: () => void;
  practiceId: string | undefined;
  practiceName: string | undefined;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements || !practiceId) {
      return;
    }

    setIsLoading(true);

    try {
      // Submit the payment element
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message || "Failed to submit payment details");
        setIsLoading(false);
        return;
      }

      // Confirm the setup
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Failed to add payment method");
        setIsLoading(false);
        return;
      }

      if (setupIntent?.payment_method) {
        // Attach payment method to customer
        const response = await fetch("/api/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "attach",
            paymentMethodId: setupIntent.payment_method,
            practiceId,
            practiceName,
          }),
        });

        if (!response.ok) {
          toast.error("Failed to save payment method");
          setIsLoading(false);
          return;
        }

        toast.success("Payment method added successfully");
        router.refresh();
        onSuccess();
      }
    } catch (error) {
      console.error("Add payment method error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Payment Method"
          )}
        </Button>
      </div>
    </form>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  practiceId: string;
  stripeCustomerId: string | null | undefined;
}

export function PaymentForm({
  invoiceId,
  invoiceNumber,
  amount,
  practiceId,
  stripeCustomerId,
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(true);

  useEffect(() => {
    // Create payment intent on component mount
    async function createPaymentIntent() {
      try {
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            invoiceId,
            invoiceNumber,
            practiceId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Payment intent error:", error);
        toast.error("Failed to initialize payment. Please try again.");
      } finally {
        setIsLoadingIntent(false);
      }
    }

    createPaymentIntent();
  }, [amount, invoiceId, invoiceNumber, practiceId]);

  if (isLoadingIntent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Processing payment setup...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Unable to initialize payment</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error setting up the payment form. Please refresh the page
            or contact support if the problem persists.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pay Invoice
        </CardTitle>
        <CardDescription>
          Enter your payment details to pay ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
            },
          }}
        >
          <PaymentFormContent
            invoiceId={invoiceId}
            invoiceNumber={invoiceNumber}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}

function PaymentFormContent({
  invoiceId,
  invoiceNumber,
}: {
  invoiceId: string;
  invoiceNumber: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Submit the payment element
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message || "Failed to submit payment details");
        setIsProcessing(false);
        return;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/invoices/${invoiceId}`,
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success(`Payment successful for invoice ${invoiceNumber}!`);
        
        // Refresh the page to show updated status
        router.refresh();
      } else if (paymentIntent && paymentIntent.status === "processing") {
        toast.info("Payment is processing. You'll be notified when complete.");
        router.push("/invoices");
      } else {
        toast.error("Payment status unclear. Please check your invoices.");
        router.push("/invoices");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An unexpected error occurred during payment");
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Your payment is secured by Stripe. We do not store your card details.
        </p>
      </div>
    </form>
  );
}


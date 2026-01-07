import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  constructWebhookEvent,
  extractPaymentSucceeded,
  extractPaymentFailed,
} from "@/lib/stripe/webhooks";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const event = constructWebhookEvent(body, signature);
    const supabase = await createClient();

    switch (event.type) {
      case "payment_intent.succeeded": {
        const data = extractPaymentSucceeded(event);
        if (data && data.invoiceId) {
          // Record the payment
          await supabase.from("payments").insert({
            invoice_id: data.invoiceId,
            amount: data.amount / 100, // Convert from cents
            stripe_payment_id: data.paymentIntentId,
            status: "completed",
            payment_method: "card",
          });

          // Update invoice status
          await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_date: new Date().toISOString(),
              amount_paid: data.amount / 100,
            })
            .eq("id", data.invoiceId);

          // Create notification for the practice
          const { data: invoice } = await supabase
            .from("invoices")
            .select("practice_id, invoice_number")
            .eq("id", data.invoiceId)
            .single();

          if (invoice) {
            await supabase.from("notifications").insert({
              practice_id: invoice.practice_id,
              type: "payment_received",
              title: "Payment Received",
              message: `Payment for invoice ${invoice.invoice_number} has been processed successfully.`,
              metadata: {
                invoiceId: data.invoiceId,
                amount: data.amount / 100,
              },
            });
          }

          // Log the audit event
          await supabase.from("audit_logs").insert({
            practice_id: invoice?.practice_id,
            action: "payment_completed",
            resource_type: "payment",
            resource_id: data.paymentIntentId,
            metadata: {
              invoiceId: data.invoiceId,
              amount: data.amount / 100,
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const data = extractPaymentFailed(event);
        if (data && data.invoiceId) {
          // Record failed payment attempt
          await supabase.from("payments").insert({
            invoice_id: data.invoiceId,
            amount: 0,
            stripe_payment_id: data.paymentIntentId,
            status: "failed",
            metadata: { error: data.errorMessage },
          });

          // Create notification for the practice
          const { data: invoice } = await supabase
            .from("invoices")
            .select("practice_id, invoice_number")
            .eq("id", data.invoiceId)
            .single();

          if (invoice) {
            await supabase.from("notifications").insert({
              practice_id: invoice.practice_id,
              type: "payment_failed",
              title: "Payment Failed",
              message: `Payment for invoice ${invoice.invoice_number} failed: ${data.errorMessage}`,
              metadata: {
                invoiceId: data.invoiceId,
                error: data.errorMessage,
              },
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}


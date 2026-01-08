import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  constructWebhookEvent,
  extractPaymentSucceeded,
  extractPaymentFailed,
} from "@/lib/stripe/webhooks";
import { createClient } from "@/lib/supabase/server";

/**
 * Stripe Webhook Handler
 * - Verifies webhook signature
 * - Implements idempotency to prevent duplicate processing
 * - Handles payment success and failure events
 */
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  const supabase = await createClient();

  // Idempotency check: prevent duplicate event processing
  const eventId = event.id;
  const { data: existingEvent } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("event_id", eventId)
    .single();

  if (existingEvent) {
    console.log(`[Stripe Webhook] Event ${eventId} already processed, skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Record the event for idempotency
  await supabase.from("webhook_events").insert({
    event_id: eventId,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  });

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const data = extractPaymentSucceeded(event);
        if (data && data.invoiceId) {
          // Check if payment already exists (additional idempotency)
          const { data: existingPayment } = await supabase
            .from("payments")
            .select("id")
            .eq("stripe_payment_id", data.paymentIntentId)
            .single();

          if (existingPayment) {
            console.log(`[Stripe Webhook] Payment ${data.paymentIntentId} already recorded`);
            break;
          }

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
        // Unhandled event type - log but don't fail
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Log error with event ID for debugging
    console.error(`[Stripe Webhook] Processing error for event ${eventId}:`, error);
    
    // Mark event as failed for retry analysis
    await supabase
      .from("webhook_events")
      .update({ 
        error: error instanceof Error ? error.message : "Unknown error",
        failed_at: new Date().toISOString(),
      })
      .eq("event_id", eventId);

    // Return 200 to prevent Stripe retries for non-recoverable errors
    // Return 500 only for temporary failures
    const isTemporaryError = error instanceof Error && 
      (error.message.includes("timeout") || error.message.includes("connection"));
    
    if (isTemporaryError) {
      return NextResponse.json(
        { error: "Temporary failure, please retry" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Webhook processing failed", received: true },
      { status: 200 }
    );
  }
}


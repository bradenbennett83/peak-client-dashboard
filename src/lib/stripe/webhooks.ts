import Stripe from "stripe";
import { getStripeClient } from "./client";

/**
 * Verify and construct a Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Handle payment_intent.succeeded webhook
 */
export interface PaymentSucceededData {
  paymentIntentId: string;
  amount: number;
  invoiceId: string | null;
  customerId: string | null;
}

export function extractPaymentSucceeded(
  event: Stripe.Event
): PaymentSucceededData | null {
  if (event.type !== "payment_intent.succeeded") {
    return null;
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  return {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    invoiceId: paymentIntent.metadata?.invoiceId || null,
    customerId:
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer?.id || null,
  };
}

/**
 * Handle payment_intent.payment_failed webhook
 */
export interface PaymentFailedData {
  paymentIntentId: string;
  invoiceId: string | null;
  errorMessage: string;
}

export function extractPaymentFailed(
  event: Stripe.Event
): PaymentFailedData | null {
  if (event.type !== "payment_intent.payment_failed") {
    return null;
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  return {
    paymentIntentId: paymentIntent.id,
    invoiceId: paymentIntent.metadata?.invoiceId || null,
    errorMessage:
      paymentIntent.last_payment_error?.message || "Payment failed",
  };
}

/**
 * Supported webhook event types
 */
export const WEBHOOK_EVENTS = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "customer.created",
  "customer.updated",
  "payment_method.attached",
  "payment_method.detached",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];


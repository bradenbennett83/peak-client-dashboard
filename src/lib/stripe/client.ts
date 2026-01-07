import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe client instance (singleton)
 */
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * Get or create a Stripe customer for a practice
 */
export async function getOrCreateCustomer(
  practiceId: string,
  practiceName: string,
  email?: string
): Promise<string> {
  const stripe = getStripeClient();

  // Search for existing customer
  const customers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    name: practiceName,
    email: email,
    metadata: {
      practiceId,
    },
  });

  return customer.id;
}

/**
 * Create a PaymentIntent for an invoice
 */
export async function createPaymentIntent(params: {
  amount: number; // in cents
  customerId: string;
  invoiceId: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();

  return await stripe.paymentIntents.create({
    amount: params.amount,
    currency: "usd",
    customer: params.customerId,
    description: params.description || `Invoice payment`,
    metadata: {
      invoiceId: params.invoiceId,
      ...params.metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

/**
 * Retrieve a PaymentIntent
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Confirm a PaymentIntent (server-side)
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
}

/**
 * Get payment methods for a customer
 */
export async function getPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const stripe = getStripeClient();
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  return paymentMethods.data;
}

/**
 * Attach a payment method to a customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripeClient();
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
}

/**
 * Set default payment method for a customer
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  const stripe = getStripeClient();
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
}

/**
 * Detach a payment method from customer
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripeClient();
  return await stripe.paymentMethods.detach(paymentMethodId);
}


import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe.js instance with safe environment variable handling.
 * Returns null if the publishable key is not configured.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error(
        "Stripe publishable key not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY."
      );
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(publishableKey);
    }
  }
  
  return stripePromise;
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentIntent, getOrCreateCustomer } from "@/lib/stripe/client";

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's profile and practice
    const { data: profile } = await supabase
      .from("users")
      .select("*, practice:practices(*)")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile || !profile.practice) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("practice_id", profile.practice_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json(
        { error: "Invoice is already paid" },
        { status: 400 }
      );
    }

    // Calculate remaining amount
    const remainingAmount =
      (invoice.amount || 0) - (invoice.amount_paid || 0);
    if (remainingAmount <= 0) {
      return NextResponse.json(
        { error: "No balance due on this invoice" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = profile.practice.stripe_customer_id;
    if (!stripeCustomerId) {
      stripeCustomerId = await getOrCreateCustomer(
        profile.practice_id,
        profile.practice.name,
        profile.practice.email || undefined
      );

      // Save the customer ID
      await supabase
        .from("practices")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", profile.practice_id);
    }

    // Create PaymentIntent
    const paymentIntent = await createPaymentIntent({
      amount: Math.round(remainingAmount * 100), // Convert to cents
      customerId: stripeCustomerId,
      invoiceId: invoice.id,
      description: `Payment for Invoice ${invoice.invoice_number}`,
      metadata: {
        practiceId: profile.practice_id,
        practiceName: profile.practice.name,
      },
    });

    // Log the action
    await supabase.from("audit_logs").insert({
      user_id: profile.id,
      practice_id: profile.practice_id,
      action: "payment_intent_created",
      resource_type: "invoice",
      resource_id: invoice.id,
      metadata: {
        paymentIntentId: paymentIntent.id,
        amount: remainingAmount,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: remainingAmount,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}


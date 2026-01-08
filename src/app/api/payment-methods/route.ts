import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  attachPaymentMethod,
  detachPaymentMethod,
  setDefaultPaymentMethod,
  getOrCreateCustomer,
} from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, paymentMethodId, practiceId, practiceName, email } = body;

    // Get or create Stripe customer
    const { data: practice } = await supabase
      .from("practices")
      .select("stripe_customer_id, id, name, email")
      .eq("id", practiceId)
      .single();

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    let customerId = practice.stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      customerId = await getOrCreateCustomer(
        practice.id,
        practiceName || practice.name,
        email || practice.email
      );

      // Update practice with customer ID
      await supabase
        .from("practices")
        .update({ stripe_customer_id: customerId })
        .eq("id", practice.id);
    }

    if (action === "attach") {
      // Attach payment method to customer
      await attachPaymentMethod(paymentMethodId, customerId);
      return NextResponse.json({ success: true });
    }

    if (action === "detach") {
      // Detach payment method
      await detachPaymentMethod(paymentMethodId);
      return NextResponse.json({ success: true });
    }

    if (action === "set_default") {
      // Set as default payment method
      await setDefaultPaymentMethod(customerId, paymentMethodId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Payment method API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


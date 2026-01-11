import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createInboundShippingLabel,
  type UPSAddress,
} from "@/lib/ups/client";
import { ApiErrors } from "@/lib/api/errors";

export async function POST(request: Request) {
  try {
    const { weight } = await request.json();

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // Get user's profile and practice
    const { data: profile } = await supabase
      .from("users")
      .select("*, practice:practices(*)")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile || !profile.practice) {
      return ApiErrors.notFound("User profile");
    }

    // Parse shipping address from practice
    let shippingAddress: UPSAddress;
    const practice = profile.practice;

    if (practice.shipping_address) {
      // Assume shipping_address is stored as JSON string or already parsed
      let addr;
      try {
        addr =
          typeof practice.shipping_address === "string"
            ? JSON.parse(practice.shipping_address)
            : practice.shipping_address;
      } catch {
        return ApiErrors.badRequest("Invalid shipping address format in practice settings");
      }

      shippingAddress = {
        name: practice.name,
        addressLine1: addr.street || addr.addressLine1,
        addressLine2: addr.street2 || addr.addressLine2,
        city: addr.city,
        stateProvinceCode: addr.state || addr.stateProvinceCode,
        postalCode: addr.zip || addr.postalCode,
        countryCode: addr.country || "US",
        phone: practice.phone || undefined,
      };
    } else {
      return ApiErrors.badRequest("Practice shipping address not configured");
    }

    // Create the shipping label
    const labelResult = await createInboundShippingLabel(
      shippingAddress,
      weight || 1
    );

    // Save the label to the database
    const { data: shippingLabel, error: insertError } = await supabase
      .from("shipping_labels")
      .insert({
        practice_id: profile.practice_id,
        tracking_number: labelResult.trackingNumber,
        carrier: "UPS",
        service: "2nd Day Air",
        direction: "inbound",
        label_url: labelResult.labelUrl,
        label_data: labelResult.labelData,
        from_address: shippingAddress,
        to_address: {
          name: "Peak Dental Studio",
          addressLine1: "123 Peak Way",
          city: "Denver",
          stateProvinceCode: "CO",
          postalCode: "80202",
          countryCode: "US",
        },
        weight: weight || 1,
        status: "created",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save shipping label:", insertError);
      return ApiErrors.serverError("Failed to save shipping label");
    }

    // Create notification
    await supabase.from("notifications").insert({
      practice_id: profile.practice_id,
      type: "shipping_label_created",
      title: "Shipping Label Created",
      message: `Your shipping label has been created. Tracking number: ${labelResult.trackingNumber}`,
      metadata: {
        shippingLabelId: shippingLabel.id,
        trackingNumber: labelResult.trackingNumber,
      },
    });

    // Log audit
    await supabase.from("audit_logs").insert({
      user_id: profile.id,
      practice_id: profile.practice_id,
      action: "shipping_label_created",
      resource_type: "shipping_label",
      resource_id: shippingLabel.id,
      metadata: {
        trackingNumber: labelResult.trackingNumber,
      },
    });

    return NextResponse.json({
      success: true,
      shippingLabel: {
        id: shippingLabel.id,
        trackingNumber: labelResult.trackingNumber,
        labelUrl: labelResult.labelUrl,
        labelData: labelResult.labelData,
      },
    });
  } catch (error) {
    console.error("Error creating shipping label:", error);
    return ApiErrors.serverError(
      error instanceof Error ? error.message : "Failed to create shipping label"
    );
  }
}


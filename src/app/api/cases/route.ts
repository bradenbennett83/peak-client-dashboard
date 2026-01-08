import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCase } from "@/lib/salesforce/cases";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile and practice
    const { data: profile } = await supabase
      .from("users")
      .select("practice_id")
      .eq("id", user.id)
      .single();

    if (!profile?.practice_id) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const { data: practice } = await supabase
      .from("practices")
      .select("salesforce_account_id")
      .eq("id", profile.practice_id)
      .single();

    if (!practice?.salesforce_account_id) {
      return NextResponse.json(
        { error: "Practice not linked to Salesforce" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      patientName,
      patientDOB,
      restorationType,
      material,
      shade,
      toothNumbers,
      dueDate,
      isRush,
      specialInstructions,
    } = body;

    // Validation
    if (!patientName || !restorationType) {
      return NextResponse.json(
        { error: "Patient name and restoration type are required" },
        { status: 400 }
      );
    }

    // Create case in Salesforce
    const result = await createCase({
      accountId: practice.salesforce_account_id,
      patientName,
      patientDOB,
      restorationType,
      material,
      shade,
      toothNumbers,
      dueDate,
      isRush,
      specialInstructions,
    });

    // Log the action
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      practice_id: profile.practice_id,
      action: "case.created",
      resource_type: "case",
      resource_id: result.id,
      metadata: {
        caseNumber: result.caseNumber,
        patientName,
        restorationType,
      },
    });

    return NextResponse.json({
      success: true,
      case: {
        id: result.id,
        caseNumber: result.caseNumber,
      },
    });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}


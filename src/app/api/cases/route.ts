import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createCase } from "@/lib/salesforce/cases";
import { ApiErrors } from "@/lib/api/errors";

// Server-side validation schema
const createCaseSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientDOB: z.string().optional(),
  restorationType: z.string().min(1, "Restoration type is required"),
  material: z.string().optional(),
  shade: z.string().optional(),
  toothNumbers: z.string().min(1, "At least one tooth number is required"),
  dueDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid due date format"
  ),
  isRush: z.boolean().optional().default(false),
  specialInstructions: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    // Get user's profile and practice
    const { data: profile } = await supabase
      .from("users")
      .select("id, practice_id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile?.practice_id) {
      return ApiErrors.notFound("User profile");
    }

    const { data: practice } = await supabase
      .from("practices")
      .select("salesforce_account_id")
      .eq("id", profile.practice_id)
      .single();

    if (!practice?.salesforce_account_id) {
      return ApiErrors.badRequest("Practice not linked to Salesforce");
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCaseSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message);
      return ApiErrors.validationFailed(errors);
    }

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
    } = validationResult.data;

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
    const { error: auditError } = await supabase.from("audit_logs").insert({
      user_id: profile.id,
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

    if (auditError) {
      console.error("Failed to log audit event:", auditError);
    }

    return NextResponse.json({
      success: true,
      case: {
        id: result.id,
        caseNumber: result.caseNumber,
      },
    });
  } catch (error) {
    console.error("Error creating case:", error);
    return ApiErrors.serverError("Failed to create case");
  }
}


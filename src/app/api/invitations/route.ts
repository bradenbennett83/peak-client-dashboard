import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { sendInvitationEmail } from "@/lib/email/invitations";
import { ApiErrors } from "@/lib/api/errors";

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return ApiErrors.badRequest("Email and role are required");
    }

    if (!["admin", "staff"].includes(role)) {
      return ApiErrors.badRequest("Invalid role. Must be 'admin' or 'staff'");
    }

    const supabase = await createClient();

    // Get the current user and verify they're an admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // Get the user's profile to verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) {
      return ApiErrors.notFound("User profile");
    }

    if (profile.role !== "admin") {
      return ApiErrors.forbidden("Only admins can invite users");
    }

    // Get the practice information
    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .select("id, name")
      .eq("id", profile.practice_id)
      .single();

    if (practiceError || !practice) {
      return ApiErrors.notFound("Practice");
    }

    // Check if email is already in use
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("practice_id", profile.practice_id)
      .single();

    if (existingUser) {
      return ApiErrors.badRequest("A user with this email already exists in your practice");
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("practice_id", profile.practice_id)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existingInvite) {
      return ApiErrors.badRequest("A pending invitation already exists for this email");
    }

    // Generate a unique token
    const token = randomBytes(32).toString("hex");

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        email: email.toLowerCase(),
        role,
        practice_id: profile.practice_id,
        invited_by: profile.id,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Failed to create invitation:", inviteError);
      return ApiErrors.serverError("Failed to create invitation");
    }

    // Generate the invitation URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error("NEXT_PUBLIC_APP_URL not configured");
      return ApiErrors.configError("Application URL not configured");
    }
    const inviteUrl = `${appUrl}/invite/${token}`;

    // Send invitation email
    try {
      await sendInvitationEmail({
        to: email,
        inviteUrl,
        practiceName: practice.name,
        inviterName: profile.name || profile.email,
        role,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Continue even if email fails - user can still manually share the link
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expires_at,
        inviteUrl,
      },
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return ApiErrors.serverError();
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) {
      return ApiErrors.notFound("User profile");
    }

    // Get pending invitations for the practice
    const { data: invitations, error: inviteError } = await supabase
      .from("invitations")
      .select(
        `
        id,
        email,
        role,
        expires_at,
        created_at,
        invited_by:users!invitations_invited_by_fkey(name, email)
      `
      )
      .eq("practice_id", profile.practice_id)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (inviteError) {
      console.error("Failed to fetch invitations:", inviteError);
      return ApiErrors.serverError("Failed to fetch invitations");
    }

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return ApiErrors.serverError();
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return ApiErrors.badRequest("Invitation ID is required");
    }

    const supabase = await createClient();

    // Get the current user and verify they're an admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) {
      return ApiErrors.notFound("User profile");
    }

    if (profile.role !== "admin") {
      return ApiErrors.forbidden("Only admins can delete invitations");
    }

    // Delete the invitation (only if it belongs to the user's practice)
    const { error: deleteError } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId)
      .eq("practice_id", profile.practice_id);

    if (deleteError) {
      console.error("Failed to delete invitation:", deleteError);
      return ApiErrors.serverError("Failed to delete invitation");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return ApiErrors.serverError();
  }
}


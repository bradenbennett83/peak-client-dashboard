import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getUserWithProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Get the user's profile from our users table
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select(
      `
      *,
      practice:practices(*)
    `
    )
    .eq("auth_user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { user, profile: null, practice: null };
  }

  return {
    user,
    profile,
    practice: profile.practice,
  };
}

export async function requireUserWithProfile() {
  const result = await getUserWithProfile();
  if (!result || !result.user) {
    redirect("/login");
  }
  return result;
}


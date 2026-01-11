# Supabase Security Configuration Guide

This document outlines the security settings that should be enabled in your Supabase project.

## Enable Leaked Password Protection

**Why:** This feature checks new passwords against the HaveIBeenPwned database to prevent users from using passwords that have been exposed in data breaches.

**How to Enable:**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the **peak-dental-portal** project
3. Navigate to **Authentication** → **Providers** → **Email**
4. Scroll down to **Password settings**
5. Enable **"Leaked password protection"** toggle
6. Click **Save**

## Verify RLS Policies

After applying the `harden_rls_policies` migration, verify the following:

### webhook_events Table
- Only accessible by the `service_role`
- No anonymous or authenticated access

### office_platform_status Table
- Users can only access records for their own practice
- No anonymous access

### audit_logs Table
- Insert allowed for authenticated users (their own actions)
- No anonymous access

## Additional Security Recommendations

### 1. Rate Limiting
Consider enabling Supabase's built-in rate limiting:
- **Authentication** → **Settings** → **Rate Limits**
- Recommended: 10 sign-in attempts per hour

### 2. Session Security
- **Authentication** → **Settings** → **Session**
- Set session timeout to 24 hours for active sessions
- Enable "Require re-authentication for sensitive operations"

### 3. CAPTCHA Protection (Optional)
- **Authentication** → **Settings** → **CAPTCHA**
- Enable hCaptcha or Turnstile for sign-up and sign-in

## Verification Checklist

- [ ] Leaked password protection enabled
- [ ] RLS policies applied via migration
- [ ] Rate limiting configured
- [ ] Session timeout set appropriately
- [ ] All environment variables configured in Vercel

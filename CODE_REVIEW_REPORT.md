# Code Review Report: Peak Client Dashboard

**Date:** January 11, 2026  
**Scope:** Core Features (Authentication, Cases, Invoices, Settings)  
**Approach:** Code Review Only  

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 5 |
| Medium | 8 |
| Low | 6 |

The codebase is well-structured with good patterns for authentication, error handling, and external integrations. However, several security issues were identified, particularly around RLS policies, authorization checks, and input validation.

---

## Critical Issues

### 1. [CRITICAL] Cases API Uses Wrong Column for User Lookup

**File:** `src/app/api/cases/route.ts:19-21`  
**Category:** Security - Authorization Bypass

**Description:**
The Cases API queries the users table using `user.id` (which is `auth.users.id`) but compares it against the `id` column instead of `auth_user_id`.

```typescript
const { data: profile } = await supabase
  .from("users")
  .select("practice_id")
  .eq("id", user.id)  // BUG: Should be .eq("auth_user_id", user.id)
  .single();
```

**Impact:**
- Case creation could fail for all users if no user happens to have a matching UUID
- OR could potentially match the wrong user profile if UUIDs coincidentally overlap

**Recommendation:**
Change to `.eq("auth_user_id", user.id)` to match the pattern used correctly in other API routes.

---

### 2. [CRITICAL] Overly Permissive RLS Policies on Multiple Tables

**Source:** Supabase Security Advisor  
**Category:** Security - Data Access Control

**Affected Tables:**
- `webhook_events` - RLS enabled but no policies exist
- `office_platform_status` - INSERT/UPDATE policies with `WITH CHECK (true)` for both `anon` and `authenticated` roles
- `audit_logs` - INSERT policy always returns true for service role

**Impact:**
- Anonymous users could potentially insert/update `office_platform_status` records
- Any authenticated user can modify any practice's platform status
- No row-level access control on these tables

**Recommendation:**
1. Add proper RLS policies to `webhook_events` table
2. Restrict `office_platform_status` policies to practice members only:
```sql
CREATE POLICY "Users can only access their practice's platform status"
ON office_platform_status
FOR ALL
USING (practice_id = get_user_practice_id())
WITH CHECK (practice_id = get_user_practice_id());
```

---

## High Priority Issues

### 3. [HIGH] Payment Methods API Missing Practice Authorization

**File:** `src/app/api/payment-methods/route.ts:21-29`  
**Category:** Security - IDOR Vulnerability

**Description:**
The payment methods API accepts `practiceId` from the request body but doesn't verify the user belongs to that practice.

```typescript
const body = await request.json();
const { action, paymentMethodId, practiceId, practiceName, email } = body;

// No verification that user belongs to this practice!
const { data: practice } = await supabase
  .from("practices")
  .select("stripe_customer_id, id, name, email")
  .eq("id", practiceId)
  .single();
```

**Impact:**
A malicious user could attach/detach payment methods from any practice.

**Recommendation:**
Add authorization check:
```typescript
const { data: profile } = await supabase
  .from("users")
  .select("practice_id")
  .eq("auth_user_id", user.id)
  .single();

if (profile.practice_id !== practiceId) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

### 4. [HIGH] Non-Null Assertion Operators on Environment Variables

**Files:** 
- `src/lib/supabase/client.ts:5-6`
- `src/app/(dashboard)/invoices/[id]/payment-form.tsx:25`
- `src/app/(dashboard)/settings/payment-methods/add-payment-method-dialog.tsx:25`

**Category:** Bug - Runtime Error Risk

**Description:**
Multiple files use `!` assertion on environment variables that could be undefined at runtime:

```typescript
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!  // Could crash if undefined
);
```

**Impact:**
If environment variables are not set, the application will crash with a confusing error.

**Recommendation:**
Add runtime validation:
```typescript
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error("Stripe key not configured");
  // Return null or show error state
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;
```

---

### 5. [HIGH] Leaked Password Protection Disabled

**Source:** Supabase Security Advisor  
**Category:** Security - Authentication

**Description:**
Supabase Auth's leaked password protection feature is disabled. This feature checks passwords against HaveIBeenPwned.org to prevent use of compromised passwords.

**Impact:**
Users can use known-compromised passwords, increasing account takeover risk.

**Recommendation:**
Enable in Supabase Dashboard: Authentication → Settings → Password Protection

---

### 6. [HIGH] Audit Log Insert Failures Are Silently Ignored

**File:** `src/app/api/cases/route.ts:79-91`  
**Category:** Bug - Observability

**Description:**
Audit log inserts don't check for errors and the operation continues regardless:

```typescript
// Log the action
await supabase.from("audit_logs").insert({
  user_id: user.id,  // Also uses wrong column
  practice_id: profile.practice_id,
  action: "case.created",
  // ...
});
// No error check - continues even if insert fails
```

**Impact:**
- Security events may not be logged
- Debugging issues becomes harder
- Also uses `user.id` instead of `profile.id`

**Recommendation:**
```typescript
const { error: auditError } = await supabase.from("audit_logs").insert({
  user_id: profile.id,  // Use the users table ID
  // ...
});
if (auditError) {
  console.error("Failed to log audit event:", auditError);
  // Consider whether to fail the operation or just log
}
```

---

### 7. [HIGH] Function Search Path Vulnerability

**Source:** Supabase Security Advisor  
**Category:** Security - SQL Injection

**Description:**
The `public.update_updated_at_column` function has a mutable search_path, which can be exploited in certain SQL injection scenarios.

**Recommendation:**
Update the function to set an explicit search_path:
```sql
ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public;
```

---

## Medium Priority Issues

### 8. [MEDIUM] Missing Server-Side Validation for Case Form

**File:** `src/app/api/cases/route.ts:57-63`  
**Category:** Bug - Input Validation

**Description:**
The API only validates `patientName` and `restorationType` but doesn't validate other fields like `toothNumbers`, `dueDate`, or `shade`:

```typescript
// Validation
if (!patientName || !restorationType) {
  return NextResponse.json(
    { error: "Patient name and restoration type are required" },
    { status: 400 }
  );
}
// No validation for toothNumbers format, dueDate validity, etc.
```

**Impact:**
Invalid data could be sent to Salesforce, causing errors or data corruption.

**Recommendation:**
Use Zod for server-side validation matching the client schema.

---

### 9. [MEDIUM] Password Change Verification Approach

**File:** `src/app/(dashboard)/settings/security/change-password-form.tsx:57-68`

**Category:** Security - Authentication Pattern

**Description:**
The password change flow re-authenticates the user with `signInWithPassword` before changing password. This could create a new session unnecessarily.

```typescript
// First, verify current password by attempting to sign in
const { error: signInError } = await supabase.auth.signInWithPassword({
  email: userEmail || "",
  password: formData.currentPassword,
});
```

**Impact:**
Minor: Creates unnecessary session activity. Could confuse session tracking.

**Recommendation:**
Use Supabase's `reauthenticate` method if available, or use `updateUser` directly as it requires an active session.

---

### 10. [MEDIUM] Missing Rate Limiting on Authentication Endpoints

**Files:** 
- `src/app/(auth)/login/login-form.tsx`
- `src/app/api/invitations/route.ts`

**Category:** Security - Brute Force Protection

**Description:**
No rate limiting is implemented on authentication or invitation endpoints.

**Impact:**
Attackers could brute-force passwords or spam invitation emails.

**Recommendation:**
1. Rely on Supabase's built-in rate limiting for auth
2. Add rate limiting middleware for API routes:
```typescript
import rateLimit from 'express-rate-limit';
// Or use Vercel Edge middleware
```

---

### 11. [MEDIUM] Invite URL May Be Undefined

**File:** `src/app/api/invitations/route.ts:136`  
**Category:** Bug - Runtime Error

**Description:**
If `NEXT_PUBLIC_APP_URL` is not set, the invite URL will be malformed:

```typescript
const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
// If env var is undefined: "undefined/invite/abc123"
```

**Impact:**
Broken invitation links in development or misconfigured deployments.

**Recommendation:**
Validate before use:
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (!appUrl) {
  console.error("NEXT_PUBLIC_APP_URL not configured");
  // Fall back or error
}
```

---

### 12. [MEDIUM] Stripe Webhook Events Table Missing Policies

**Source:** Supabase Security Advisor  
**Category:** Security - Data Protection

**Description:**
The `webhook_events` table has RLS enabled but no policies defined.

**Impact:**
Depending on default behavior, this could either block all access or allow all access.

**Recommendation:**
Add appropriate RLS policies:
```sql
-- Only allow service role to insert (for webhooks)
CREATE POLICY "Service role only"
ON webhook_events
FOR ALL
TO service_role
USING (true);
```

---

### 13. [MEDIUM] JSON.parse Without Try-Catch

**File:** `src/app/api/shipping/create-label/route.ts:44-47`  
**Category:** Bug - Error Handling

**Description:**
```typescript
const addr =
  typeof practice.shipping_address === "string"
    ? JSON.parse(practice.shipping_address)  // No try-catch!
    : practice.shipping_address;
```

**Impact:**
Malformed JSON in database would crash the endpoint.

**Recommendation:**
Wrap in try-catch:
```typescript
try {
  const addr = typeof practice.shipping_address === "string"
    ? JSON.parse(practice.shipping_address)
    : practice.shipping_address;
} catch (e) {
  return NextResponse.json(
    { error: "Invalid shipping address format" },
    { status: 400 }
  );
}
```

---

### 14. [MEDIUM] Salesforce Connection Not Reset on All Errors

**File:** `src/lib/salesforce/client.ts:82-94`  
**Category:** Bug - Error Recovery

**Description:**
Connection reset only happens for session-related errors, but other authentication errors might leave a stale connection.

**Impact:**
Potential for persistent connection issues after network errors.

**Recommendation:**
Add more error types to the reset condition or implement a TTL-based refresh.

---

### 15. [MEDIUM] User Email Could Be Undefined in Password Change

**File:** `src/app/(dashboard)/settings/security/change-password-form.tsx:59-61`

**Description:**
```typescript
const { error: signInError } = await supabase.auth.signInWithPassword({
  email: userEmail || "",  // Empty string if undefined
  password: formData.currentPassword,
});
```

**Impact:**
If email is undefined, login will fail with a confusing error.

**Recommendation:**
Guard before the operation:
```typescript
if (!userEmail) {
  toast.error("User email not available");
  return;
}
```

---

## Low Priority Issues

### 16. [LOW] Console.log Statements in Production

**Multiple Files**

**Description:**
Multiple `console.error` and `console.log` statements throughout the codebase.

**Recommendation:**
Use a proper logging service (Sentry, LogRocket, etc.) or create a logging utility that can be disabled in production.

---

### 17. [LOW] Hardcoded Peak Dental Address

**File:** `src/lib/ups/client.ts:89-97`

**Description:**
```typescript
export const PEAK_DENTAL_ADDRESS: UPSAddress = {
  name: "Peak Dental Studio",
  addressLine1: "123 Peak Way", // Hardcoded
  city: "Denver",
  // ...
};
```

**Recommendation:**
Move to environment variable or configuration file.

---

### 18. [LOW] Missing Loading States on Some Forms

**Various Files**

**Description:**
Some form buttons don't disable properly during submission, potentially allowing double-submits.

**Recommendation:**
Ensure all submit buttons have `disabled={isLoading}`.

---

### 19. [LOW] Stripe API Version Pinned to Future Date

**File:** `src/lib/stripe/client.ts:15`

```typescript
stripeInstance = new Stripe(secretKey, {
  apiVersion: "2025-12-15.clover",  // Future-dated
  // ...
});
```

**Recommendation:**
Use current stable API version.

---

### 20. [LOW] Missing Type Exports

**File:** `src/types/database.types.ts`

**Description:**
The `webhook_events` table type is not exported despite being used.

**Recommendation:**
Add to exports if used elsewhere.

---

### 21. [LOW] Inconsistent Error Message Formatting

**Various API Routes**

**Description:**
Some errors return `{ error: "message" }` and others return `{ error: "Title", message: "details" }`.

**Recommendation:**
Standardize error response format across all API routes.

---

## Quick Wins (< 30 minutes each)

1. ✅ Fix `.eq("id", user.id)` to `.eq("auth_user_id", user.id)` in `cases/route.ts`
2. ✅ Add practice authorization to payment-methods API
3. ✅ Wrap JSON.parse in try-catch for shipping address
4. ✅ Add validation for `NEXT_PUBLIC_APP_URL` in invitations
5. ✅ Enable leaked password protection in Supabase Dashboard
6. ✅ Fix audit log user_id column usage
7. ✅ Add explicit search_path to database function

---

## Architecture Recommendations

### 1. Create Shared Authorization Middleware

Extract common authorization patterns into reusable middleware:

```typescript
// lib/api/auth-middleware.ts
export async function requirePracticeAuth(supabase: SupabaseClient, userId: string) {
  const { data: profile, error } = await supabase
    .from("users")
    .select("*, practice:practices(*)")
    .eq("auth_user_id", userId)
    .single();
    
  if (error || !profile) {
    throw new AuthError("User profile not found");
  }
  
  return profile;
}
```

### 2. Add Zod Validation Layer

Create shared Zod schemas for API routes:

```typescript
// lib/validations/case.ts
export const createCaseSchema = z.object({
  patientName: z.string().min(2),
  restorationType: z.string().min(1),
  toothNumbers: z.string().regex(/^[\d,]+$/),
  dueDate: z.string().datetime(),
  // ...
});
```

### 3. Implement Error Boundary Component

Add React error boundaries around critical components:

```typescript
// components/error-boundary.tsx
export function FeatureErrorBoundary({ children, feature }) {
  return (
    <ErrorBoundary
      fallback={<FeatureError feature={feature} />}
      onError={(error) => Sentry.captureException(error)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 4. Add Database Function for Practice Access Check

```sql
CREATE OR REPLACE FUNCTION user_can_access_practice(practice_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND practice_id = practice_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Summary of Required Actions

### Immediate (This Week)
- [x] Fix cases API authorization bug - **FIXED** (2026-01-11)
- [x] Add practice authorization to payment-methods API - **FIXED** (2026-01-11)
- [x] Enable leaked password protection - **DOCUMENTED** (see `docs/SUPABASE_SECURITY_SETUP.md`)
- [x] Add RLS policies to webhook_events table - **FIXED** (2026-01-11)

### Short-term (Next Sprint)
- [x] Fix overly permissive RLS policies on office_platform_status - **FIXED** (2026-01-11)
- [x] Add server-side validation to all API routes - **FIXED** (cases API, 2026-01-11)
- [x] Wrap JSON.parse calls in try-catch - **FIXED** (shipping, 2026-01-11)
- [x] Validate environment variables at runtime - **FIXED** (2026-01-11)

### Long-term (Backlog)
- [ ] Implement rate limiting
- [ ] Create shared authorization middleware
- [x] Standardize error response format - **FIXED** (2026-01-11, see `src/lib/api/errors.ts`)
- [ ] Add comprehensive logging solution

---

## Fixes Applied (2026-01-11)

### Code Changes
1. **`src/app/api/cases/route.ts`**
   - Fixed user lookup to use `auth_user_id` instead of `id`
   - Fixed audit log to use `profile.id` instead of `user.id`
   - Added Zod schema for server-side validation
   - Standardized error responses using `ApiErrors`

2. **`src/app/api/payment-methods/route.ts`**
   - Added practice ownership verification before any Stripe operations
   - Standardized error responses using `ApiErrors`

3. **`src/app/api/shipping/create-label/route.ts`**
   - Wrapped `JSON.parse` in try-catch for shipping address
   - Standardized error responses using `ApiErrors`

4. **`src/app/api/invitations/route.ts`**
   - Added validation for `NEXT_PUBLIC_APP_URL`
   - Standardized error responses using `ApiErrors`

5. **`src/lib/supabase/client.ts`**
   - Added runtime validation for environment variables

6. **`src/lib/stripe/get-stripe.ts`** (new file)
   - Safe Stripe initialization with env var validation

7. **`src/app/(dashboard)/invoices/[id]/payment-form.tsx`**
   - Updated to use safe Stripe initialization

8. **`src/app/(dashboard)/settings/payment-methods/add-payment-method-dialog.tsx`**
   - Updated to use safe Stripe initialization

9. **`src/lib/api/errors.ts`** (new file)
   - Standardized API error response helper

### Database Migrations Applied
- `harden_rls_policies`: Added RLS policies for `webhook_events`, fixed `office_platform_status` policies, set `search_path` for `update_updated_at_column` function

### Documentation Added
- `docs/SUPABASE_SECURITY_SETUP.md`: Guide for enabling leaked password protection and verifying RLS policies

---

*Report generated by automated code review*
*Last updated: 2026-01-11*

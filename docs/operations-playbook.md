# Operations Playbook

## Overview

This playbook provides guidance for handling common operational scenarios in the Peak Dental Studio Client Portal.

---

## Table of Contents

1. [Payment Issues](#payment-issues)
2. [User Access Issues](#user-access-issues)
3. [Case Submission Issues](#case-submission-issues)
4. [Shipping Label Issues](#shipping-label-issues)
5. [Email/Notification Issues](#emailnotification-issues)
6. [Performance Issues](#performance-issues)
7. [Security Incidents](#security-incidents)

---

## Payment Issues

### Payment Failed

**Symptoms:**
- Customer reports payment didn't go through
- Invoice still shows as unpaid

**Investigation Steps:**

1. **Check Stripe Dashboard**
   - Go to stripe.com/dashboard → Payments
   - Search by customer email or payment ID
   - Review payment status and any decline codes

2. **Check Webhook Events**
   ```sql
   SELECT * FROM webhook_events 
   WHERE event_type LIKE 'payment%' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

3. **Common Decline Codes**
   | Code | Meaning | Resolution |
   |------|---------|------------|
   | `insufficient_funds` | Card has no funds | Ask customer to use different card |
   | `card_declined` | Generic decline | Ask customer to contact bank |
   | `expired_card` | Card expired | Update card details |
   | `incorrect_cvc` | Wrong CVC | Re-enter card details |

4. **Resolution**
   - If payment actually succeeded, manually update invoice status
   - If failed, have customer retry with different card

### Duplicate Payment

**Symptoms:**
- Customer charged twice
- Two payment records for same invoice

**Investigation Steps:**

1. **Check Payment Records**
   ```sql
   SELECT * FROM payments 
   WHERE invoice_id = '[INVOICE_ID]' 
   ORDER BY created_at DESC;
   ```

2. **Check Stripe Dashboard**
   - Verify both charges exist
   - Check if one is a pre-authorization

3. **Resolution**
   - If duplicate charge confirmed, initiate refund in Stripe
   - Update payment records in database
   - Notify customer of refund (3-5 business days)

---

## User Access Issues

### User Can't Login

**Symptoms:**
- "Invalid credentials" error
- User locked out

**Investigation Steps:**

1. **Check User Exists**
   ```sql
   SELECT id, email, created_at, email_confirmed_at 
   FROM auth.users 
   WHERE email = '[USER_EMAIL]';
   ```

2. **Check User Profile**
   ```sql
   SELECT * FROM public.users 
   WHERE email = '[USER_EMAIL]';
   ```

3. **Common Issues**
   | Issue | Resolution |
   |-------|------------|
   | Email not confirmed | Resend confirmation email |
   | Wrong password | Use password reset flow |
   | Account disabled | Re-enable in Supabase dashboard |
   | Wrong practice | Check practice_id assignment |

4. **Resolution**
   - Reset password via Supabase Dashboard → Authentication → Users
   - Or trigger password reset email

### Invitation Not Received

**Symptoms:**
- New user didn't get invitation email
- Invitation link expired

**Investigation Steps:**

1. **Check Invitation Record**
   ```sql
   SELECT * FROM invitations 
   WHERE email = '[USER_EMAIL]' 
   ORDER BY created_at DESC;
   ```

2. **Check Invitation Status**
   - `pending`: Not yet accepted
   - `accepted`: Already used
   - `expired`: Past expiration date

3. **Resolution**
   - Delete old invitation if needed
   - Create new invitation with fresh link
   - Manually share link if email delivery issues persist

---

## Case Submission Issues

### Case Not Created in Salesforce

**Symptoms:**
- Case submitted in portal
- Not appearing in Salesforce

**Investigation Steps:**

1. **Check Audit Log**
   ```sql
   SELECT * FROM audit_logs 
   WHERE action = 'case.created' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

2. **Check Salesforce Connection**
   - Verify Salesforce credentials in environment
   - Check for Salesforce API limits

3. **Common Issues**
   | Issue | Resolution |
   |-------|------------|
   | API timeout | Retry submission |
   | Invalid AccountId | Verify practice's Salesforce mapping |
   | Field validation | Check required fields |
   | Session expired | Credentials auto-refresh |

4. **Resolution**
   - If API issue, retry case creation
   - If data issue, correct and resubmit

---

## Shipping Label Issues

### Label Generation Failed

**Symptoms:**
- Error when creating shipping label
- UPS API timeout

**Investigation Steps:**

1. **Check UPS API Status**
   - Visit status.ups.com
   - Check for service outages

2. **Check Audit Log**
   ```sql
   SELECT * FROM audit_logs 
   WHERE action LIKE '%shipping%' 
   ORDER BY created_at DESC;
   ```

3. **Common Issues**
   | Issue | Resolution |
   |-------|------------|
   | Invalid address | Verify address format |
   | Account issue | Check UPS account status |
   | API limit | Wait and retry |
   | Auth expired | Refresh UPS credentials |

4. **Resolution**
   - Validate shipping address
   - Retry label generation
   - Contact UPS support if persistent

---

## Email/Notification Issues

### Notifications Not Delivered

**Symptoms:**
- User not receiving email notifications
- In-app notifications missing

**Investigation Steps:**

1. **Check Notification Records**
   ```sql
   SELECT * FROM notifications 
   WHERE practice_id = '[PRACTICE_ID]' 
   ORDER BY created_at DESC 
   LIMIT 20;
   ```

2. **Check Notification Preferences**
   ```sql
   SELECT * FROM users 
   WHERE practice_id = '[PRACTICE_ID]';
   -- Check notification_preferences column
   ```

3. **For Email Issues**
   - Check email service dashboard (SendGrid/Resend)
   - Verify email is not in spam
   - Check bounce/complaint rates

4. **Resolution**
   - Verify notification preferences are enabled
   - Add email to allowlist if spam filtering
   - Resend notification manually if needed

---

## Performance Issues

### Slow Page Load

**Symptoms:**
- Pages taking > 3 seconds to load
- Users complaining about speed

**Investigation Steps:**

1. **Check Vercel Analytics**
   - Review Core Web Vitals
   - Identify slow pages

2. **Check Database Queries**
   ```sql
   -- Check for slow queries in Supabase dashboard
   -- Database → Reports → Query Performance
   ```

3. **Common Causes**
   | Cause | Resolution |
   |-------|------------|
   | Large data sets | Add pagination |
   | Missing indexes | Add database indexes |
   | API bottleneck | Optimize external calls |
   | Bundle size | Code split components |

4. **Resolution**
   - Add indexes for frequent queries
   - Implement pagination for large lists
   - Enable caching where appropriate

---

## Security Incidents

### Suspected Unauthorized Access

**Symptoms:**
- Unusual login patterns
- Data accessed without authorization

**Immediate Actions:**

1. **Contain**
   - Disable suspicious user account immediately
   - Revoke all active sessions

2. **Investigate**
   ```sql
   SELECT * FROM audit_logs 
   WHERE user_id = '[SUSPECTED_USER_ID]' 
   ORDER BY created_at DESC;
   ```

3. **Document**
   - Record all findings
   - Preserve logs
   - Note timeline of events

4. **Notify**
   - Alert security team lead
   - If data breach confirmed, follow breach notification procedures

### Rate Limit Exceeded

**Symptoms:**
- 429 errors from API
- Automated attack suspected

**Investigation Steps:**

1. **Check for Patterns**
   - Review Vercel logs for IP patterns
   - Check if legitimate user or bot

2. **Response**
   - If attack: Block IP range in Vercel
   - If legitimate: Increase rate limits temporarily

---

## Data Management

### PII/PHI Handling Guidelines

**Never Log:**
- Passwords or password hashes
- Full credit card numbers
- Social Security Numbers
- Patient health records content

**OK to Log (with caution):**
- User IDs (UUID)
- Action types
- Timestamps
- Error messages (sanitized)
- Request paths

### Data Deletion Request

For GDPR/HIPAA compliance:

1. **Verify Request**
   - Confirm requester identity
   - Document the request

2. **Delete User Data**
   ```sql
   -- Export user data first (if requested)
   SELECT * FROM users WHERE id = '[USER_ID]';
   
   -- Delete in order (respecting foreign keys)
   DELETE FROM notifications WHERE user_id = '[USER_ID]';
   DELETE FROM audit_logs WHERE user_id = '[USER_ID]';
   DELETE FROM users WHERE id = '[USER_ID]';
   
   -- Delete from Supabase Auth
   -- Use Supabase Dashboard → Authentication → Users
   ```

3. **Confirm & Document**
   - Verify deletion complete
   - Maintain deletion log (date, requester, what was deleted)

---

## Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Technical Lead | TBD | TBD | Business hours |
| On-Call Engineer | TBD | TBD | 24/7 |
| Supabase Support | - | support@supabase.io | Business hours |
| Stripe Support | - | support.stripe.com | 24/7 |
| Vercel Support | - | support@vercel.com | Business hours |

---

## Escalation Matrix

```
Tier 1 (Support Team)
    ↓ (15 min no resolution)
Tier 2 (Technical Lead)
    ↓ (30 min no resolution)
Tier 3 (Engineering Team)
    ↓ (Critical issues only)
External Support (Supabase/Stripe/Vercel)
```

---

*Last Updated: January 2026*
*Maintained By: Peak Dental Studio Operations Team*


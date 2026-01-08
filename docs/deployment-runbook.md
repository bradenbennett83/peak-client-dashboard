# Deployment Runbook

## Overview

This document outlines the deployment process for the Peak Dental Studio Client Portal.

## Environments

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| Development | localhost:3000 | any | Local development |
| Staging | staging.portal.peakdentalstudio.com | develop | Testing & QA |
| Production | portal.peakdentalstudio.com | main | Live customers |

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All E2E tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables are configured in Vercel
- [ ] Database migrations have been applied
- [ ] Critical features manually tested on staging

## Environment Variables

### Required for All Environments

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

### Required for Production

```bash
# Supabase (server)
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (server)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Salesforce
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_USERNAME=
SALESFORCE_PASSWORD=
SALESFORCE_SECURITY_TOKEN=
SALESFORCE_LOGIN_URL=

# UPS
UPS_CLIENT_ID=
UPS_CLIENT_SECRET=
UPS_ACCOUNT_NUMBER=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

## Deployment Process

### Automatic Deployments (Recommended)

1. **Development → Staging**
   - Push to `develop` branch
   - Vercel automatically deploys to staging
   - Preview URL available within 2-3 minutes

2. **Staging → Production**
   - Create PR from `develop` to `main`
   - Review changes and run smoke tests on staging
   - Merge PR
   - Vercel automatically deploys to production

### Manual Deployment

If automatic deployment fails:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to staging
vercel --env staging

# Deploy to production
vercel --prod
```

## Post-Deployment Verification

### Smoke Tests

Run these immediately after deployment:

1. **Login Flow**
   - Navigate to /login
   - Verify page loads without errors
   - Test with invalid credentials (should show error)

2. **Dashboard**
   - Login with valid account
   - Verify dashboard loads with data
   - Check sidebar navigation works

3. **Critical Features**
   - Submit a test case
   - View invoice list
   - Create shipping label (test mode)
   - Check notifications

### Monitoring Checks

- [ ] Check Sentry for new errors (sentry.io)
- [ ] Verify Vercel Analytics shows traffic
- [ ] Check uptime monitoring (if configured)
- [ ] Review API response times in Vercel dashboard

## Rollback Procedure

### Via Vercel Dashboard (Fastest)

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last working deployment
3. Click the three dots menu → "Promote to Production"
4. Confirm the rollback

### Via Git

```bash
# Find the last working commit
git log --oneline -10

# Revert to specific commit
git revert HEAD
git push origin main

# Or hard reset (use with caution)
git reset --hard <commit-hash>
git push origin main --force
```

### Database Rollback

If a migration caused issues:

1. Go to Supabase Dashboard → Database → Migrations
2. Identify the problematic migration
3. Run rollback SQL (if available) or restore from backup
4. Contact support@supabase.io if needed

## Incident Response

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| SEV-1 | Complete outage | Immediate | Site down, payments broken |
| SEV-2 | Major feature broken | < 1 hour | Can't submit cases |
| SEV-3 | Minor issue | < 4 hours | UI glitch, slow performance |
| SEV-4 | Enhancement | Next sprint | Feature request |

### SEV-1 Response

1. **Acknowledge** - Confirm the issue within 5 minutes
2. **Assess** - Determine scope and impact
3. **Communicate** - Notify stakeholders
4. **Mitigate** - Rollback if needed
5. **Resolve** - Fix the root cause
6. **Review** - Post-incident review within 24 hours

### Contact Information

- **Technical Lead**: [Your Name] - [email]
- **On-Call Rotation**: [Rotation Schedule]
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Stripe Support**: https://support.stripe.com

## Database Migrations

### Applying Migrations

Migrations are applied via Supabase MCP or dashboard:

```sql
-- Example migration
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);
```

### Migration Best Practices

1. **Test locally first** using Supabase local development
2. **Apply to staging** and verify
3. **Schedule production migrations** during low-traffic periods
4. **Have rollback SQL ready** for each migration
5. **Document all schema changes** in migration files

## Monitoring & Alerting

### Key Metrics

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error Rate | > 1% | Investigate |
| Response Time | > 3s | Optimize |
| Uptime | < 99.9% | Investigate |
| Memory Usage | > 80% | Scale up |

### Alert Channels

- **Sentry**: Email + Slack for errors
- **Vercel**: Deployment notifications
- **Uptime Robot**: SMS for downtime

## Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls

# Pull production env vars locally
vercel env pull .env.local

# Run E2E tests
npm test

# Build locally
npm run build
```

## Troubleshooting

### Common Issues

**Build Fails**
- Check TypeScript errors: `npm run lint`
- Verify all env vars are set
- Clear `.next` folder and rebuild

**Deployment Stuck**
- Check Vercel build logs
- Verify Git permissions
- Try manual deployment

**Environment Variables Not Working**
- Verify variable names match exactly
- Check scope (Preview/Production)
- Redeploy after changing env vars

**Database Connection Issues**
- Verify Supabase project is active
- Check connection string
- Verify RLS policies allow access

---

*Last Updated: January 2026*
*Maintained By: Peak Dental Studio Engineering Team*


# Peak Dental Studio Client Portal — Implementation Plan

**Version:** 1.1  
**Created:** January 7, 2026  
**Updated:** January 8, 2026  
**Status:** All Phases Complete - Ready for Production

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 0: Alignment & Decomposition](#phase-0-alignment--decomposition) ✅
3. [Phase 1: Architecture & Foundations](#phase-1-architecture--foundations) ✅
4. [Phase 2: Auth & User Management](#phase-2-auth--user-management) ✅
5. [Phase 3: Core Data Integrations](#phase-3-core-data-integrations) ✅
6. [Phase 4: Dashboard & Navigation](#phase-4-dashboard--navigation) ✅
7. [Phase 5: Case Management](#phase-5-case-management) ✅
8. [Phase 6: Invoices & Payments](#phase-6-invoices--payments) ✅
9. [Phase 7: Shipping Labels](#phase-7-shipping-labels) ✅
10. [Phase 8: Notifications & Settings](#phase-8-notifications--settings) ✅
11. [Phase 9: QA, Hardening, Launch](#phase-9-qa-hardening-launch) ✅
12. [MCP Tools Reference](#mcp-tools-reference)
13. [Appendix](#appendix)

---

## Executive Summary

This implementation plan details the complete build-out of the Peak Dental Studio Client Portal—a customer-facing web application for dental practices to manage cases, invoices, payments, and shipping with Peak Dental Studio.

### Key Deliverables

- **Next.js 15 App Router** application with TypeScript
- **Supabase** backend with PostgreSQL, Row Level Security, and Edge Functions
- **Salesforce** integration for cases and invoices (read-only sync)
- **Stripe** integration for payments
- **UPS** integration for prepaid shipping labels
- **HIPAA-ready** architecture with audit logging

### Timeline (Estimated)

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0: Alignment | 1 day | ✅ Complete |
| Phase 1: Architecture | 1-2 days | ✅ Complete |
| Phase 2: Auth | 2-3 days | ✅ Complete |
| Phase 3: Integrations | 3-4 days | ✅ Complete |
| Phase 4: Dashboard | 1-2 days | ✅ Complete |
| Phase 5: Cases | 2-3 days | ✅ Complete |
| Phase 6: Invoices | 2-3 days | ✅ Complete |
| Phase 7: Shipping | 1-2 days | ✅ Complete |
| Phase 8: Notifications | 1-2 days | ✅ Complete |
| Phase 9: QA & Launch | 3-5 days | ✅ Complete |

---

## Phase 0: Alignment & Decomposition ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Reviewed PRD.md and brand guidelines
2. ✅ Extracted scope, success metrics, milestones
3. ✅ Documented technology stack decisions
4. ✅ Created implementation plan document

### MCP Tools Used

- **Context7 MCP**: Researched Next.js 15 App Router patterns
- **Context7 MCP**: Researched Supabase SSR authentication
- **Context7 MCP**: Researched Shadcn UI components
- **Supabase MCP**: Searched documentation for auth patterns

---

## Phase 1: Architecture & Foundations ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Initialized Next.js 15 project with TypeScript, Tailwind, ESLint
2. ✅ Installed Shadcn UI with custom Peak brand theme
3. ✅ Set up Supabase client utilities (browser, server, middleware)
4. ✅ Created route structure for all pages
5. ✅ Set up environment configuration (.env.example)
6. ✅ Created TypeScript types for database schema

### Project Structure

```
peak-client-dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth pages (login, signup, etc.)
│   │   ├── (dashboard)/     # Protected dashboard pages
│   │   ├── api/             # API routes
│   │   └── auth/            # Auth callback routes
│   ├── components/
│   │   ├── layout/          # App layout components
│   │   └── ui/              # Shadcn UI components
│   ├── lib/
│   │   ├── auth/            # Auth utilities
│   │   ├── salesforce/      # Salesforce integration
│   │   ├── stripe/          # Stripe integration
│   │   ├── supabase/        # Supabase clients
│   │   └── ups/             # UPS shipping integration
│   └── types/               # TypeScript type definitions
├── docs/                    # Documentation
└── public/                  # Static assets
```

---

## Phase 2: Auth & User Management ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Created login page with email/password authentication
2. ✅ Created signup page (for invited users)
3. ✅ Created forgot password flow
4. ✅ Implemented auth callback routes
5. ✅ Set up middleware for session management
6. ✅ Created invitation system for team members
7. ✅ Built user management page for admins
8. ✅ Applied database migrations for invitations and audit_logs tables
9. ✅ Configured RLS policies for all tables

### Database Schema Updates

- Added `invitations` table for user invitation workflow
- Added `audit_logs` table for HIPAA compliance
- Enhanced `users` table with first_name, last_name, salesforce_contact_id

---

## Phase 3: Core Data Integrations ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Created Salesforce client with connection pooling
2. ✅ Built case data mapper (Salesforce → App format)
3. ✅ Built invoice data mapper (Salesforce → App format)
4. ✅ Created Stripe client with payment intent creation
5. ✅ Created Stripe webhook handler
6. ✅ Created UPS client for shipping label generation
7. ✅ Created API routes for payments and shipping

### Integration Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   Next.js App   │────▶│  Supabase (DB)   │
└─────────────────┘     └──────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│   Salesforce    │     │  Stripe Webhooks │
│   (Cases/INV)   │     │   (Payments)     │
└─────────────────┘     └──────────────────┘
        │
        ▼
┌─────────────────┐
│   UPS API       │
│  (Shipping)     │
└─────────────────┘
```

---

## Phase 4: Dashboard & Navigation ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Created app sidebar with navigation
2. ✅ Created app topbar with search, notifications, user menu
3. ✅ Built dashboard layout with SidebarProvider
4. ✅ Created dashboard page with summary cards
5. ✅ Added quick actions and recent activity sections

---

## Phase 5: Case Management ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Created cases list page with search/filter
2. ✅ Built case cards with status badges
3. ✅ Created case detail page
4. ✅ Added case timeline view
5. ✅ Integrated file attachments display
6. ✅ Added tracking information display

---

## Phase 6: Invoices & Payments ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Created invoices list page
2. ✅ Built invoice summary cards
3. ✅ Created payment intent API
4. ✅ Set up Stripe webhook processing
5. ✅ Added payment notifications

---

## Phase 7: Shipping Labels ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Created shipping page with label list
2. ✅ Built new shipping label form
3. ✅ Created shipping label API with UPS integration
4. ✅ Added label download and tracking links

---

## Phase 8: Notifications & Settings ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Built notifications page with list, filtering, mark-as-read, and delete functionality
2. ✅ Added real-time notifications with Supabase Realtime subscription
3. ✅ Created practice profile settings page (name, contact, addresses)
4. ✅ Added notification preferences page (email/in-app toggles, digest frequency)
5. ✅ Created security settings page with password change form

---

## Phase 9: QA, Hardening, Launch ✅

**Status:** COMPLETE

### Completed Tasks

1. ✅ Created Playwright E2E test suite for critical flows
   - Authentication tests (login, logout, forgot password)
   - Navigation tests (protected routes redirect)
   - Smoke tests (page load, API health, error handling)
2. ✅ Added security hardening
   - Security headers (CSP, HSTS, X-Frame-Options, etc.)
   - Stripe webhook idempotency with `webhook_events` table
   - Rate limiting utility for API routes
   - Environment variable validation
3. ✅ Set up Sentry monitoring and error tracking
   - Client, server, and edge configuration
   - Error boundaries for graceful error handling
   - Release tracking and source maps
4. ✅ Performance optimization
   - Loading skeleton components for better perceived performance
   - Optimized package imports (lucide-react, Radix)
   - 404 and error pages for graceful failures
5. ✅ Deployment configuration
   - Vercel configuration (`vercel.json`)
   - Environment variable documentation
   - Deployment runbook with rollback procedures
6. ✅ Operations documentation
   - Operations playbook (payment issues, user access, security incidents)
   - Incident response procedures
   - Data handling guidelines (PII/PHI)

### New Files Created

```
e2e/
├── auth.spec.ts          # Authentication E2E tests
├── navigation.spec.ts    # Navigation E2E tests
└── smoke.spec.ts         # Smoke tests for deployments

src/
├── app/
│   ├── error.tsx         # Error boundary page
│   ├── global-error.tsx  # Global error handler
│   └── not-found.tsx     # Custom 404 page
├── components/
│   └── error-boundary.tsx # Reusable error component
├── instrumentation.ts    # Sentry instrumentation
└── lib/
    ├── env.ts            # Environment validation
    └── security/
        └── rate-limit.ts # API rate limiting

docs/
├── deployment-runbook.md   # Deployment procedures
└── operations-playbook.md  # Operations support guide

sentry.client.config.ts     # Sentry client config
sentry.server.config.ts     # Sentry server config
sentry.edge.config.ts       # Sentry edge config
playwright.config.ts        # Playwright configuration
vercel.json                 # Vercel deployment config
```

---

## MCP Tools Reference

### Context7 MCP

Used for researching up-to-date documentation:

- **Next.js 15**: App Router, Server Components, Layouts
- **Supabase**: SSR auth, RLS policies, Edge Functions
- **Shadcn UI**: Component installation and usage
- **Stripe**: Payment Intents, webhooks

### Supabase MCP

Used for database operations:

- `list_projects` - List available Supabase projects
- `get_project` - Get project details
- `list_tables` - View database schema
- `apply_migration` - Apply SQL migrations
- `execute_sql` - Run ad-hoc queries
- `generate_typescript_types` - Generate TypeScript types

### Firecrawl MCP

Reserved for web research when needed.

### Perplexity MCP

Reserved for technical questions and research.

---

## Appendix

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Salesforce
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_USERNAME=
SALESFORCE_PASSWORD=
SALESFORCE_SECURITY_TOKEN=
SALESFORCE_LOGIN_URL=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# UPS
UPS_CLIENT_ID=
UPS_CLIENT_SECRET=
UPS_ACCOUNT_NUMBER=

# App
NEXT_PUBLIC_APP_URL=
```

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run lint

# Run all E2E tests
npm test

# Run smoke tests only
npm run test:smoke

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Debug tests
npm run test:debug
```

### Next Steps for Production

1. **Set Up Vercel Project**
   - Connect GitHub repo to Vercel
   - Configure environment variables
   - Set up staging and production environments

2. **Configure Third-Party Services**
   - Sentry: Create project, get DSN
   - Stripe: Set up webhook endpoints
   - Salesforce: Verify API credentials
   - UPS: Test API credentials

3. **Domain & DNS**
   - Purchase/configure custom domain
   - Set up SSL certificate
   - Configure DNS records

4. **Final Testing**
   - Run full E2E test suite
   - Manual testing on staging
   - Performance audit with Lighthouse

5. **Go Live**
   - Deploy to production
   - Monitor Sentry for errors
   - Verify all integrations working

# Peak Dental Studio - Client Portal

A modern web application for dental practices to manage cases, invoices, payments, and shipping with Peak Dental Studio.

## Features

- **Case Management**: Submit and track dental lab cases
- **Invoice & Payments**: View invoices and pay securely with Stripe
- **Shipping Labels**: Generate prepaid UPS shipping labels
- **Real-time Notifications**: Get instant updates on case status changes
- **Team Management**: Invite and manage team members
- **Settings**: Configure practice profile, notifications, and security

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Shipping**: UPS API
- **CRM Integration**: Salesforce

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Supabase account and project
- Stripe account (for payments)
- UPS account (for shipping labels)
- Salesforce account (for case/invoice sync)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/bradenbennett83/peak-client-dashboard.git
cd peak-client-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Salesforce
SALESFORCE_CLIENT_ID=your-salesforce-client-id
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret
SALESFORCE_USERNAME=your-salesforce-username
SALESFORCE_PASSWORD=your-salesforce-password
SALESFORCE_SECURITY_TOKEN=your-salesforce-security-token
SALESFORCE_LOGIN_URL=https://login.salesforce.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# UPS
UPS_CLIENT_ID=your-ups-client-id
UPS_CLIENT_SECRET=your-ups-client-secret
UPS_ACCOUNT_NUMBER=your-ups-account-number

# Email (Optional - for invitation emails)
# RESEND_API_KEY=re_your-resend-api-key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
peak-client-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   ├── notifications/     # Notification components
│   │   └── ui/                # Shadcn UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── auth/              # Authentication utilities
│   │   ├── email/             # Email service
│   │   ├── salesforce/        # Salesforce integration
│   │   ├── stripe/            # Stripe integration
│   │   ├── supabase/          # Supabase clients
│   │   └── ups/               # UPS shipping integration
│   └── types/                 # TypeScript type definitions
├── docs/                      # Documentation
└── public/                    # Static assets
```

## Key Features

### Authentication

- Email/password authentication via Supabase Auth
- Invitation-based user onboarding
- Role-based access control (Admin/Staff)
- Password reset functionality

### Case Management

- Submit new cases with patient information
- Track case status in real-time
- View case history and timeline
- Upload and manage case files

### Invoices & Payments

- View pending and paid invoices
- Secure payment processing with Stripe
- Save payment methods for future use
- Automatic payment confirmations

### Shipping

- Generate prepaid UPS shipping labels
- Track shipments in real-time
- View shipping history
- Download shipping labels as PDF

### Notifications

- Real-time notifications via Supabase Realtime
- Email notifications (configurable)
- In-app notification center
- Notification preferences management

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Migrations

Database migrations are managed through Supabase. See `docs/implementation-plan.md` for the complete database schema.

### Testing

Testing infrastructure will be added in Phase 9 (QA & Hardening).

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- Self-hosted with Docker

## Environment Variables

See the "Installation" section above for required environment variables. All sensitive keys should be kept secure and never committed to version control.

## Contributing

This is a private project for Peak Dental Studio. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved by Peak Dental Studio

## Support

For technical support or questions:
- Email: support@peakdentalstudio.com
- Phone: (800) 555-1234
- Hours: Mon-Fri, 8am-6pm EST

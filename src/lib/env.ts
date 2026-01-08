/**
 * Environment Variable Validation
 * 
 * This module validates required environment variables at build/startup time.
 * Fail fast if required configuration is missing.
 */

/**
 * Get required environment variable or throw
 */
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
function getOptionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Validated environment configuration
 * 
 * Use this instead of process.env directly for type safety and validation
 */
export const env = {
  // App
  nodeEnv: getOptionalEnv("NODE_ENV", "development"),
  appUrl: getOptionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Supabase (required)
  supabase: {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    // Service role is only needed server-side
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },

  // Stripe (required for payments)
  stripe: {
    publishableKey: getRequiredEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },

  // Salesforce (required for cases/invoices)
  salesforce: {
    clientId: process.env.SALESFORCE_CLIENT_ID || "",
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET || "",
    username: process.env.SALESFORCE_USERNAME || "",
    password: process.env.SALESFORCE_PASSWORD || "",
    securityToken: process.env.SALESFORCE_SECURITY_TOKEN || "",
    loginUrl: getOptionalEnv("SALESFORCE_LOGIN_URL", "https://login.salesforce.com"),
  },

  // UPS (required for shipping)
  ups: {
    clientId: process.env.UPS_CLIENT_ID || "",
    clientSecret: process.env.UPS_CLIENT_SECRET || "",
    accountNumber: process.env.UPS_ACCOUNT_NUMBER || "",
  },

  // Sentry (optional but recommended)
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  },
} as const;

/**
 * Validate all required environment variables
 * Call this early in the application lifecycle
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  // Required for all environments
  const requiredPublic = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ];

  for (const name of requiredPublic) {
    if (!process.env[name]) {
      missing.push(name);
    }
  }

  // Required for server-side in production
  if (process.env.NODE_ENV === "production") {
    const requiredServer = [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];

    for (const name of requiredServer) {
      if (!process.env[name]) {
        missing.push(name);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Log environment status (without exposing secrets)
 */
export function logEnvStatus(): void {
  const { valid, missing } = validateEnv();

  console.log("=== Environment Configuration ===");
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`App URL: ${env.appUrl}`);
  console.log(`Supabase: ${env.supabase.url ? "✓" : "✗"}`);
  console.log(`Stripe: ${env.stripe.publishableKey ? "✓" : "✗"}`);
  console.log(`Sentry: ${env.sentry.dsn ? "✓" : "Not configured"}`);
  
  if (!valid) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  } else {
    console.log("All required environment variables present ✓");
  }
  console.log("================================");
}


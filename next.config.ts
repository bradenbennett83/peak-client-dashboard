import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Security headers for production
 * https://nextjs.org/docs/advanced-features/security-headers
 */
const securityHeaders = [
  {
    // Prevent clickjacking attacks
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Prevent MIME type sniffing
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Control referrer information
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Enable HSTS (only in production with HTTPS)
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // Control browser features
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // XSS protection (legacy browsers)
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    // Content Security Policy
    // Note: Stripe requires specific domains for payment processing
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self, Stripe, and inline for Next.js hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network",
      // Styles: self and inline for styled components/CSS-in-JS
      "style-src 'self' 'unsafe-inline'",
      // Images: self, data URIs, and blob URIs
      "img-src 'self' data: blob: https://*.stripe.com",
      // Fonts: self and data URIs
      "font-src 'self' data:",
      // Connect: API calls to self, Supabase, Stripe, Salesforce, UPS
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.salesforce.com https://onlinetools.ups.com",
      // Frames: Stripe for 3D Secure
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      // Form actions
      "form-action 'self'",
      // Base URI
      "base-uri 'self'",
      // Object/embed sources (disabled)
      "object-src 'none'",
      // Upgrade insecure requests in production
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Strict mode for React
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  // Logging for debugging in development
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

// Wrap with Sentry (only in production or when DSN is configured)
const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enable automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

export default withSentryConfig(nextConfig, sentryConfig);

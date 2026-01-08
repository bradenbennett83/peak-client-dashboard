// This file configures the initialization of Sentry on the server.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Adjust this value in production
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out non-critical errors
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    if (error instanceof Error) {
      // Ignore expected auth errors
      if (error.message.includes("Invalid login credentials")) {
        return null;
      }
      // Ignore rate limit errors (logged separately)
      if (error.message.includes("Rate limit exceeded")) {
        return null;
      }
    }
    
    return event;
  },

  // Set the environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Spotlight for local development
  spotlight: process.env.NODE_ENV === "development",
});


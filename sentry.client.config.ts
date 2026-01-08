// This file configures the initialization of Sentry on the client.
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

  // Replay configuration
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Add integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out non-critical errors
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Ignore network errors that are expected
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        return null;
      }
      if (error.message.includes("NetworkError")) {
        return null;
      }
      // Ignore cancelled requests
      if (error.message.includes("AbortError")) {
        return null;
      }
    }
    
    return event;
  },

  // Set the environment
  environment: process.env.NODE_ENV,

  // Release tracking (set during build)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});


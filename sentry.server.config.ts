// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  spotlight: process.env.NODE_ENV !== "production",
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Force Vercel AI integration to always register span processors.
  // Without this, the integration may not activate on Vercel because the 'ai' package
  // is bundled (not externalized), preventing OTEL from patching module loading.
  integrations: [Sentry.vercelAIIntegration({ force: true })],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  sendDefaultPii: true,
});

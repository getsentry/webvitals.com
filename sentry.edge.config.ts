// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://8639dbee918dc5a6b6a70cd17297ef06@o4505994951065600.ingest.us.sentry.io/4509957293801472",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  integrations: [Sentry.vercelAIIntegration()],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

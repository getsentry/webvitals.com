// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/chat",
      method: "POST",
    },
    {
      path: "/api/follow-up-suggestions",
      method: "POST",
    },
  ],
});

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  spotlight: process.env.NODE_ENV !== "production",
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration({
      _experiments: {
        enableStandaloneLcpSpans: true,
        enableStandaloneClsSpans: true,
      },
    }),
  ],
  tracesSampleRate: 1,

  enableLogs: true,

  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1.0,

  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

import * as Sentry from "@sentry/astro";

Sentry.init({
	dsn: import.meta.env.PUBLIC_SENTRY_DSN,
	// Adds request headers and IP for users, for more info visit:
	// https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
	sendDefaultPii: true,
	integrations: [
		Sentry.browserTracingIntegration(),
		Sentry.replayIntegration(),
	],
	// Enable logs to be sent to Sentry
	enableLogs: true,
	// Define how likely traces are sampled. Adjust this value in production,
	// or use tracesSampler for greater control.
	tracesSampleRate: 1.0,
	// This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysSessionSampleRate: 0.1,
	// If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
	replaysOnErrorSampleRate: 1.0,
});

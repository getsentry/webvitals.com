import { withSentryConfig } from "@sentry/nextjs";
import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const { withPlausibleProxy } = require("next-plausible");

const nextConfig: NextConfig = {
  // Configure external packages that should not be bundled by Next.js
  serverExternalPackages: [
    "import-in-the-middle",
    "require-in-the-middle",
    "shiki",
  ],
  // Configure external packages that need server-side handling
  transpilePackages: ["streamdown"],
};

export default withSentryConfig(withBotId(withPlausibleProxy()(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "sentry",

  project: "webvitals",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",
});

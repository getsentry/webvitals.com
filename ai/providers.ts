import { createOpenAI } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";

/**
 * Custom OpenAI provider with fetch interception for bot protection compatibility.
 *
 * Safari and Firefox may have issues with certain fetch behaviors that affect
 * bot protection (botid). This custom fetch wrapper ensures consistent behavior
 * across all browsers.
 */
export const openai = createOpenAI({
  // Custom fetch to intercept requests for bot protection compatibility
  fetch: async (url, options) => {
    // Ensure headers are properly formatted for all browsers
    const headers = new Headers(options?.headers);

    // Safari/Firefox may need explicit content-type for streaming
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    Sentry.logger.debug("OpenAI API request", {
      url: url.toString(),
      method: options?.method || "POST",
    });

    const response = await fetch(url, {
      ...options,
      headers,
      // Ensure credentials are handled consistently across browsers
      credentials: "same-origin",
    });

    Sentry.logger.debug("OpenAI API response", {
      url: url.toString(),
      status: response.status,
      ok: response.ok,
    });

    return response;
  },
});

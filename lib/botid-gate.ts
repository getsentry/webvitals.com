import * as Sentry from "@sentry/nextjs";
import { checkBotId } from "botid/server";

/**
 * Deny bot traffic on any remotely accessible deployment.
 *
 * BotID is the only abuse control in front of the paid AI routes, so it must
 * run on production and preview alike. VERCEL_ENV is unset only in local
 * development, which is the sole bypass. Unverifiable callers (a thrown
 * check) are denied rather than allowed to start paid work.
 *
 * Returns a 403 Response when the caller must be rejected, or null to let
 * the request proceed.
 */
export async function denyBots(request: Request): Promise<Response | null> {
  if (!process.env.VERCEL_ENV) {
    return null;
  }

  try {
    const botIdResult = await checkBotId();
    Sentry.logger.debug("BotID check result", {
      isBot: botIdResult.isBot,
      userAgent: request.headers.get("user-agent"),
    });
    if (botIdResult.isBot) {
      Sentry.logger.warn("BotID check failed", {
        isBot: botIdResult.isBot,
        userAgent: request.headers.get("user-agent"),
      });
      return new Response("Access Denied", { status: 403 });
    }
  } catch (error) {
    Sentry.logger.warn("BotID check threw exception", {
      error: error instanceof Error ? error.message : String(error),
      userAgent: request.headers.get("user-agent"),
    });
    return new Response("Access Denied", { status: 403 });
  }

  return null;
}

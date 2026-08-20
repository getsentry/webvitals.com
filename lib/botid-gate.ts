import * as Sentry from "@sentry/nextjs";
import { checkBotId } from "botid/server";
import { BOT_DENIAL_BODIES } from "./bot-denial";

/**
 * Deny bot traffic on any remotely accessible deployment.
 *
 * BotID is the only abuse control in front of the paid AI routes, so it must
 * run on production and preview alike. VERCEL_ENV is unset only in local
 * development, which is the sole bypass. Unverifiable callers (a thrown
 * check) are denied rather than allowed to start paid work.
 *
 * A denial is reported as a Sentry log, never an exception: blocking a bot is
 * the gate working, not a fault. The two denial bodies are distinct so the
 * browser can tell an expected block from an unverifiable one.
 *
 * Returns a 403 Response when the caller must be rejected, or null to let
 * the request proceed.
 */
export async function denyBots(request: Request): Promise<Response | null> {
  if (!process.env.VERCEL_ENV) {
    return null;
  }

  const userAgent = request.headers.get("user-agent");

  try {
    const botIdResult = await checkBotId();
    const classification = {
      isBot: botIdResult.isBot,
      isHuman: botIdResult.isHuman,
      isVerifiedBot: botIdResult.isVerifiedBot,
      bypassed: botIdResult.bypassed,
      userAgent,
    };

    Sentry.logger.debug("BotID check result", classification);
    if (botIdResult.isBot) {
      Sentry.logger.warn("BotID check failed", {
        ...classification,
        url: request.url,
      });
      return new Response(BOT_DENIAL_BODIES.bot, { status: 403 });
    }
  } catch (error) {
    Sentry.logger.warn("BotID check threw exception", {
      error: error instanceof Error ? error.message : String(error),
      userAgent,
    });
    return new Response(BOT_DENIAL_BODIES.unverifiable, { status: 403 });
  }

  return null;
}

/**
 * Shared vocabulary for BotID denials.
 *
 * The chat transport in @workflow/ai drops response headers and folds the
 * response body into its error message (`Failed to fetch chat: 403 <body>`),
 * so the body text is the only channel the browser can classify a denial by.
 */
export const BOT_DENIAL_BODIES = {
  /** BotID classified the caller as a bot. Expected traffic, not a fault. */
  bot: "Access Denied: bot_detected",
  /** The BotID check itself failed, so the caller could not be verified. */
  unverifiable: "Access Denied: bot_check_unavailable",
} as const;

export function isBotDetectedError(error: unknown): boolean {
  return error instanceof Error && error.message.includes(BOT_DENIAL_BODIES.bot);
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import { denyBots } from "@/lib/botid-gate";

const checkBotId = vi.hoisted(() => vi.fn());

vi.mock("botid/server", () => ({ checkBotId }));

function request() {
  return new Request("https://webvitals.com/api/chat", {
    method: "POST",
    headers: { "user-agent": "test-agent" },
  });
}

describe("denyBots", () => {
  beforeEach(() => {
    checkBotId.mockReset();
    vi.unstubAllEnvs();
  });

  it("skips the check only in local development (no VERCEL_ENV)", async () => {
    vi.stubEnv("VERCEL_ENV", "");
    expect(await denyBots(request())).toBeNull();
    expect(checkBotId).not.toHaveBeenCalled();
  });

  it("allows verified human traffic in production", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    checkBotId.mockResolvedValue({ isBot: false });
    expect(await denyBots(request())).toBeNull();
  });

  it("denies bots in production", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    checkBotId.mockResolvedValue({ isBot: true });
    const response = await denyBots(request());
    expect(response?.status).toBe(403);
  });

  it("enforces the check on preview deployments", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    checkBotId.mockResolvedValue({ isBot: true });
    const response = await denyBots(request());
    expect(response?.status).toBe(403);
    expect(checkBotId).toHaveBeenCalledOnce();
  });

  it("fails closed when the check throws", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    checkBotId.mockRejectedValue(new Error("verification headers missing"));
    const response = await denyBots(request());
    expect(response?.status).toBe(403);
  });
});

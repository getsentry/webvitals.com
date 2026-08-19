import { beforeEach, describe, expect, it, vi } from "vitest";
import { realWorldPerformanceTool } from "@/ai/tools/real-world-performance";

const toolOptions = { toolCallId: "test-call", messages: [] };

function stubCruxResponses(status: number, statusText: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: statusText } }), {
        status,
        statusText,
      }),
    ),
  );
}

describe("real-world performance CrUX error handling", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubEnv("GOOGLE_API_KEY", "test-key");
  });

  it("degrades 400 responses (invalid or not-in-dataset URL) to no-data", async () => {
    stubCruxResponses(400, "Bad Request");
    const result = (await realWorldPerformanceTool.execute?.(
      { url: "definitely-not-in-crux.example", devices: ["mobile", "desktop"] },
      toolOptions,
    )) as { hasData: boolean };

    expect(result.hasData).toBe(false);
  });

  it("surfaces 500 responses (upstream outage) as a blocking failure", async () => {
    stubCruxResponses(500, "Internal Server Error");
    await expect(
      realWorldPerformanceTool.execute?.(
        { url: "example.com", devices: ["mobile", "desktop"] },
        toolOptions,
      ),
    ).rejects.toThrow(/Failed to fetch CrUX data for all requested devices/);
  });

  it("surfaces 429 responses as a blocking failure", async () => {
    stubCruxResponses(429, "Too Many Requests");
    await expect(
      realWorldPerformanceTool.execute?.(
        { url: "example.com", devices: ["mobile", "desktop"] },
        toolOptions,
      ),
    ).rejects.toThrow(/Failed to fetch CrUX data for all requested devices/);
  });
});

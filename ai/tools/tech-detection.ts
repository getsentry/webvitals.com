import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type {
  CloudflareScanResult,
  CloudflareSearchResponse,
  CloudflareSubmitResponse,
  CloudflareTechnology,
} from "@/types/cloudflare-tech";

const techDetectionInputSchema = z.object({
  url: z.string().describe("The URL to analyze for technology detection"),
});

interface TechDetectionOutput {
  technologies: Array<{
    name: string;
    confidence: number;
    categories: string[];
  }>;
}

class CloudflareTechDetector {
  private apiToken: string;
  private baseUrl: string;

  constructor(accountId: string, apiToken: string) {
    this.apiToken = apiToken;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/urlscanner/v2`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      next: {
        revalidate: 3600, // 1 hour cache
        tags: [`cloudflare:${endpoint}`],
      },
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 409 && errorData.result?.tasks) {
        return errorData as T;
      }

      if (response.status === 404) {
        throw new Error("Scan not ready");
      }

      throw new Error(
        `Cloudflare API error ${response.status}: ${
          errorData.message || response.statusText
        }`,
      );
    }

    return response.json();
  }

  async searchScans(query: string): Promise<CloudflareSearchResponse> {
    const searchParams = new URLSearchParams({
      q: query,
      limit: "1",
    });

    return this.makeRequest<CloudflareSearchResponse>(
      `/search?${searchParams}`,
    );
  }

  async submitScan(url: string): Promise<CloudflareSubmitResponse> {
    return this.makeRequest<CloudflareSubmitResponse>("/scan", {
      method: "POST",
      body: JSON.stringify({
        url,
        visibility: "Unlisted",
        screenshotsResolutions: [], // No screenshots needed
      }),
    });
  }

  async getScanResult(scanId: string): Promise<CloudflareScanResult> {
    return this.makeRequest<CloudflareScanResult>(`/result/${scanId}`);
  }

  async waitForScanCompletion(
    scanId: string,
    maxWaitTime = 60000,
    pollInterval = 5000,
  ): Promise<CloudflareScanResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = await this.getScanResult(scanId);

        if (result?.task?.success === true) {
          return result;
        } else if (result?.task?.success === false) {
          throw new Error("Scan failed");
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Scan not ready") {
          // Continue polling
        } else {
          throw error;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Scan did not complete within ${maxWaitTime}ms`);
  }
}

async function detectTechnologies(url: string): Promise<TechDetectionOutput> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables are required",
    );
  }

  const client = new CloudflareTechDetector(accountId, apiToken);

  try {
    Sentry.logger.info("Starting technology detection", {
      url: normalizedUrl,
    });

    const searchQuery = `task.url:"${normalizedUrl}"`;
    let scanResult: CloudflareScanResult | undefined;

    try {
      const searchResults = await client.searchScans(searchQuery);

      if (searchResults.results?.length > 0) {
        const recentResult = searchResults.results[0];
        const scanId = recentResult.task.uuid;

        try {
          scanResult = await client.getScanResult(scanId);
        } catch (fetchError) {
          Sentry.logger.warn("Failed to fetch scan result", {
            scanId,
            error:
              fetchError instanceof Error
                ? fetchError.message
                : "Unknown error",
          });
        }
      }
    } catch (searchError) {
      Sentry.logger.warn("Failed to search scans", {
        error:
          searchError instanceof Error ? searchError.message : "Unknown error",
      });
    }

    if (!scanResult?.meta?.processors?.wappa?.data) {
      const submission = await client.submitScan(normalizedUrl);
      let scanId: string;

      if (submission.result?.tasks) {
        scanId = submission.result.tasks[0].uuid;
      } else if (submission.uuid) {
        scanId = submission.uuid;
      } else {
        throw new Error("Failed to get scan ID from submission");
      }

      try {
        scanResult = await client.getScanResult(scanId);
        if (scanResult?.task?.success !== true) {
          scanResult = await client.waitForScanCompletion(scanId);
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Scan not ready") {
          scanResult = await client.waitForScanCompletion(scanId);
        } else {
          throw error;
        }
      }
    }

    if (!scanResult || !scanResult.task?.success) {
      throw new Error("Failed to get valid scan results");
    }

    const wappaData = scanResult?.meta?.processors?.wappa?.data || [];

    const technologies = wappaData.map((tech: CloudflareTechnology) => ({
      name: tech.app,
      confidence: tech.confidenceTotal || 0,
      categories: tech.categories?.map((cat) => cat.name) || [],
    }));

    const result: TechDetectionOutput = {
      technologies: technologies.sort((a, b) => b.confidence - a.confidence),
    };

    Sentry.logger.info("Technology detection completed", {
      url: normalizedUrl,
      techCount: technologies.length,
      scanId: scanResult.task?.uuid,
    });

    return result;
  } catch (error) {
    Sentry.logger.error("Technology detection failed", {
      url: normalizedUrl,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    Sentry.captureException(error, {
      tags: {
        component: "tech-detection-tool",
        operation: "detectTechnologies",
      },
      extra: { url: normalizedUrl },
    });

    return {
      technologies: [],
    };
  }
}

export const techDetectionTool = tool({
  description:
    "Detect website technologies using Cloudflare's fingerprinting. Returns all detected technologies with confidence scores and categories directly from the API. No hardcoded mappings.",
  inputSchema: techDetectionInputSchema,
  execute: async (input) => {
    const { url } = input;
    if (!url) {
      throw new Error("URL is required for technology detection");
    }
    return detectTechnologies(url);
  },
});

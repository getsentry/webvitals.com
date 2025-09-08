import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import {
  analyzeNetworkRequests,
  calculateSecurityScore,
  extractTechStack,
  generateSecuritySummary,
  getScanOverview,
  getSecurityRiskLevel,
} from "@/lib/cloudflare-scanner-utils";
import type {
  CloudflareScannerToolOutput,
  ScanResult,
  ScanSearchResponse,
  ScanStatus,
  ScanSubmissionResponse,
  ScanVisibility,
  ScreenshotResolution,
} from "@/types/cloudflare-scanner";

const DEFAULT_SCREENSHOT_RESOLUTIONS: ScreenshotResolution[] = ["desktop"];
const DEFAULT_VISIBILITY: ScanVisibility = "Unlisted";

const cloudflareScantoolInputSchema = z.object({
  url: z.string().describe("The URL to scan for security threats and malware"),
  visibility: z
    .enum(["Public", "Unlisted"])
    .optional()
    .default(DEFAULT_VISIBILITY)
    .describe(
      "Scan visibility - Public appears in recent scans, Unlisted is private",
    ),
  screenshotResolutions: z
    .array(z.enum(["desktop", "mobile", "tablet"]))
    .optional()
    .default(DEFAULT_SCREENSHOT_RESOLUTIONS)
    .describe("Screenshot resolutions to capture"),
  customHeaders: z
    .record(z.string(), z.string())
    .optional()
    .describe("Custom HTTP headers to include in the scan"),
  waitForResults: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to wait for scan completion and return results"),
});

const cloudflareSearchInputSchema = z.object({
  query: z
    .string()
    .describe(
      "Search query using ElasticSearch syntax (e.g., 'page.domain:example.com', 'verdicts.malicious:true')",
    ),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Maximum number of results to return (1-100)"),
  offset: z
    .number()
    .min(0)
    .optional()
    .default(0)
    .describe("Number of results to skip for pagination"),
});

class CloudflareScannerClient {
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cloudflare URL Scanner API failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  async submitScan(request: {
    url: string;
    visibility?: ScanVisibility;
    screenshotsResolutions?: ScreenshotResolution[];
    customHeaders?: Record<string, string>;
    customagent?: string;
    referer?: string;
  }): Promise<ScanSubmissionResponse> {
    return this.makeRequest<ScanSubmissionResponse>("/scan", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getScanResult(scanId: string): Promise<ScanResult> {
    const response = await this.makeRequest<{ data: ScanResult }>(
      `/result/${scanId}`,
    );
    // The API wraps the actual scan result in a 'data' property
    return response.data;
  }

  async waitForScanCompletion(
    scanId: string,
    maxWaitTime = 300000, // 5 minutes
    pollInterval = 15000, // 15 seconds
  ): Promise<ScanResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = await this.getScanResult(scanId);
        // The task object might not have status, check success flag instead
        if (result.task.success === true) {
          return result;
        } else if (result.task.success === false) {
          throw new Error(`Scan ${scanId} failed`);
        }

        Sentry.logger.debug("Scan still in progress", {
          scanId,
          success: result.task.success,
          elapsedTime: Date.now() - startTime,
        });
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("404") ||
            error.message.includes("not found") ||
            error.message.includes("not ready"))
        ) {
          // Scan not ready yet, continue polling
          Sentry.logger.debug("Scan not ready, continuing to poll", {
            scanId,
            elapsedTime: Date.now() - startTime,
          });
        } else {
          throw error;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Scan ${scanId} did not complete within ${maxWaitTime}ms`);
  }

  async searchScans(params: {
    query: string;
    limit?: number;
    offset?: number;
  }): Promise<ScanSearchResponse> {
    const searchParams = new URLSearchParams({
      q: params.query,
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    return this.makeRequest<ScanSearchResponse>(`/search?${searchParams}`);
  }

  async getScreenshot(
    scanId: string,
    resolution: ScreenshotResolution = "desktop",
  ): Promise<ArrayBuffer> {
    const url = `${this.baseUrl}/result/${scanId}/screenshot?resolution=${resolution}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get screenshot: ${response.status} ${response.statusText}`,
      );
    }

    return response.arrayBuffer();
  }

  async getNetworkLog(scanId: string): Promise<unknown> {
    return this.makeRequest(`/result/${scanId}/har`);
  }
}

/**
 * Generate comprehensive summary for chat agent analysis
 */
function generateComprehensiveSummary(result: ScanResult) {
  const overview = getScanOverview(result);
  const security = generateSecuritySummary(result);
  const network = analyzeNetworkRequests(result);
  const techStack = extractTechStack(result);

  return {
    // Security Assessment
    malicious: security.malicious,
    hasVerdicts: result.verdicts?.overall?.hasVerdicts || false,
    riskLevel: security.riskLevel,
    securityScore: security.score,
    threats: security.threats,

    // Site Information
    domain: overview.domain,
    finalUrl: overview.finalUrl,
    country: overview.country,
    server: overview.server,
    ip: result.page?.ip,

    // Network Analysis
    totalRequests: network.totalRequests,
    uniqueDomains: network.uniqueDomains,
    thirdPartyRequests: network.thirdPartyRequests,
    httpRequests: network.httpRequests,
    httpsRequests: network.httpsRequests,

    // Technology Stack
    technologies: {
      detected:
        result.meta?.processors?.wappa?.data?.map((tech: any) => tech.app) ||
        [],
      webServer: techStack.webServer,
      framework: techStack.framework,
      analytics: techStack.analytics,
      security: techStack.security,
    },

    // Resources
    reportUrl: result.task?.reportURL,
    screenshotUrl: result.task?.screenshotURL,
    hasScreenshot: overview.hasScreenshot,
  };
}

async function runCloudflareUrlScan(
  url: string,
  visibility: ScanVisibility = DEFAULT_VISIBILITY,
  screenshotResolutions: ScreenshotResolution[] = DEFAULT_SCREENSHOT_RESOLUTIONS,
  customHeaders?: Record<string, string>,
  waitForResults = true,
): Promise<CloudflareScannerToolOutput> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables are required",
    );
  }

  const client = new CloudflareScannerClient(accountId, apiToken);

  try {
    Sentry.logger.info("Starting Cloudflare URL Scanner analysis", {
      url: normalizedUrl,
      visibility,
      screenshotResolutions,
      waitForResults,
      hasCustomHeaders: !!customHeaders,
    });

    const submission = await client.submitScan({
      url: normalizedUrl,
      visibility,
      screenshotsResolutions: screenshotResolutions,
      customHeaders,
    });

    let result: ScanResult | undefined;

    if (waitForResults) {
      Sentry.logger.info("Waiting for scan completion", {
        scanId: submission.uuid,
      });
      result = await client.waitForScanCompletion(submission.uuid);
    }

    const status: ScanStatus =
      result?.task.success === true
        ? "finished"
        : result?.task.success === false
          ? "failed"
          : "queued";

    const output: CloudflareScannerToolOutput = {
      scanId: submission.uuid,
      scanUrl: submission.api,
      status,
      result,
      summary: result ? generateComprehensiveSummary(result) : undefined,
    };

    Sentry.logger.info("Cloudflare URL Scanner analysis completed", {
      url: normalizedUrl,
      scanId: submission.uuid,
      status: output.status,
      malicious: result?.verdicts?.overall?.malicious,
      hasVerdicts: result?.verdicts?.overall?.hasVerdicts,
      categories: result?.verdicts?.overall?.categories,
      hasResult: !!result,
      reportURL: result?.task?.reportURL,
      screenshotURL: result?.task?.screenshotURL,
      domain: result?.page?.domain,
      country: result?.page?.country,
      technologies: result?.meta?.processors?.wappa?.data?.length || 0,
      success: result?.task?.success,
    });

    return output;
  } catch (error) {
    Sentry.logger.error("Cloudflare URL Scanner analysis failed", {
      url: normalizedUrl,
      visibility,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new Error(
      `Cloudflare URL Scanner analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

async function searchCloudflareScans(
  query: string,
  limit = 20,
  offset = 0,
): Promise<ScanSearchResponse> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables are required",
    );
  }

  const client = new CloudflareScannerClient(accountId, apiToken);

  try {
    Sentry.logger.info("Searching Cloudflare URL Scanner results", {
      query,
      limit,
      offset,
    });

    const results = await client.searchScans({ query, limit, offset });

    Sentry.logger.info("Cloudflare URL Scanner search completed", {
      query,
      resultCount: results.results?.length || 0,
    });

    return results;
  } catch (error) {
    Sentry.logger.error("Cloudflare URL Scanner search failed", {
      query,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new Error(
      `Cloudflare URL Scanner search failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export const cloudflareUrlScannerTool = tool({
  description:
    "Analyze URLs for security threats, malware, and phishing using Cloudflare's URL Scanner. Provides detailed information about the website including screenshots, network requests, technologies used, domain reputation, and security verdicts. Can detect malicious content, phishing attempts, and provide comprehensive security analysis.",
  inputSchema: cloudflareScantoolInputSchema,
  execute: async ({
    url,
    visibility,
    screenshotResolutions,
    customHeaders,
    waitForResults,
  }) => {
    return await runCloudflareUrlScan(
      url,
      visibility,
      screenshotResolutions,
      customHeaders,
      waitForResults,
    );
  },
});

export const cloudflareSearchTool = tool({
  description:
    "Search existing Cloudflare URL Scanner results using ElasticSearch query syntax. Useful for finding similar threats, checking domain history, or analyzing patterns. Examples: 'page.domain:example.com', 'verdicts.malicious:true', 'date:>now-7d'",
  inputSchema: cloudflareSearchInputSchema,
  execute: async ({ query, limit, offset }) => {
    return await searchCloudflareScans(query, limit, offset);
  },
});

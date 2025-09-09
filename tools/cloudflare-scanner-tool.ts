import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import { generateSecuritySummary } from "@/lib/cloudflare-scanner-utils";
import type {
  CloudflareScannerToolOutput,
  RecentScanResponse,
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
  private accountId: string;

  constructor(accountId: string, apiToken: string) {
    this.accountId = accountId;
    this.apiToken = apiToken;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/urlscanner/v2`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || "GET";

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
      const errorData = await response.json();

      // Handle 409 "recently scanned" - return existing scan info
      if (response.status === 409 && errorData.result?.tasks) {
        Sentry.logger.info("Cloudflare API: Using recent scan", {
          endpoint,
          tasksCount: errorData.result.tasks.length,
        });
        return errorData as T;
      }

      const error = new Error(
        `Cloudflare API error ${response.status}: ${errorData.message || response.statusText}`,
      );

      // Don't capture Sentry error for 404 "Scan is not finished yet" - this is expected behavior
      const isScanNotFinished =
        response.status === 404 &&
        (errorData.message?.includes("Scan is not finished yet") ||
          errorData.message?.includes("not found") ||
          errorData.message?.includes("not ready"));

      if (!isScanNotFinished) {
        Sentry.captureException(error, {
          tags: {
            component: "cloudflare-scanner",
            api_endpoint: endpoint,
            api_status: response.status.toString(),
          },
          contexts: {
            api_request: {
              method,
              endpoint,
              url,
            },
            api_response: {
              status: response.status,
              statusText: response.statusText,
              error_data: errorData,
            },
          },
        });
      }

      throw error;
    }

    const responseData = await response.json();
    if (!responseData) {
      const error = new Error("API returned empty response");
      Sentry.captureException(error, {
        tags: {
          component: "cloudflare-scanner",
          api_endpoint: endpoint,
        },
        contexts: {
          api_request: {
            method,
            endpoint,
            url,
          },
        },
      });
      throw error;
    }

    return responseData;
  }

  async submitScan(request: {
    url: string;
    visibility?: ScanVisibility;
    screenshotsResolutions?: ScreenshotResolution[];
    customHeaders?: Record<string, string>;
    customagent?: string;
    referer?: string;
  }): Promise<ScanSubmissionResponse | RecentScanResponse> {
    return this.makeRequest<ScanSubmissionResponse | RecentScanResponse>(
      "/scan",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async getScanResult(scanId: string): Promise<ScanResult> {
    const response = await this.makeRequest<ScanResult>(`/result/${scanId}`);

    if (!response) {
      const error = new Error(`No scan result returned for scanId: ${scanId}`);
      Sentry.captureException(error, {
        tags: {
          component: "cloudflare-scanner",
          operation: "getScanResult",
        },
        extra: { scanId },
      });
      throw error;
    }

    if (!response.task) {
      const error = new Error(
        `Invalid scan result - missing task data for scanId: ${scanId}`,
      );
      Sentry.captureException(error, {
        tags: {
          component: "cloudflare-scanner",
          operation: "getScanResult",
        },
        extra: {
          scanId,
          responseKeys: response ? Object.keys(response) : "null response",
        },
      });
      throw error;
    }

    return response;
  }

  async waitForScanCompletion(
    scanId: string,
    maxWaitTime = 300000, // 5 minutes
    pollInterval = 15000, // 15 seconds
  ): Promise<ScanResult> {
    const startTime = Date.now();

    Sentry.logger.info("Cloudflare scan polling started", {
      scanId,
      maxWaitTime,
      pollInterval,
    });

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = await this.getScanResult(scanId);
        const elapsedTime = Date.now() - startTime;

        // Check task.success - true means completed, false means failed
        if (result?.task?.success === true) {
          Sentry.logger.info("Cloudflare scan completed successfully", {
            scanId,
            elapsedTime,
            malicious: result.verdicts?.overall?.malicious,
          });
          return result;
        } else if (result?.task?.success === false) {
          const error = new Error(`Scan ${scanId} failed`);
          Sentry.captureException(error, {
            tags: {
              component: "cloudflare-scanner",
              operation: "waitForScanCompletion",
            },
            extra: { scanId, elapsedTime },
          });
          throw error;
        }

        // task.success might be null/undefined while in progress - only log every 30 seconds
        if (elapsedTime % 30000 < pollInterval) {
          Sentry.logger.debug("Cloudflare scan still in progress", {
            scanId,
            success: result?.task?.success,
            elapsedTime,
          });
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("404") ||
            error.message.includes("not found") ||
            error.message.includes("not ready"))
        ) {
          // Scan not ready yet (404), continue polling - only log occasionally
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime % 60000 < pollInterval) {
            // Log every minute
            Sentry.logger.debug(
              "Cloudflare scan not ready, continuing to poll",
              {
                scanId,
                elapsedTime,
              },
            );
          }
        } else {
          throw error;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    const actualTime = Date.now() - startTime;
    const timeoutError = new Error(
      `Scan ${scanId} did not complete within ${maxWaitTime}ms`,
    );
    Sentry.captureException(timeoutError, {
      tags: {
        component: "cloudflare-scanner",
        operation: "waitForScanCompletion",
      },
      extra: { scanId, maxWaitTime, actualTime },
    });
    throw timeoutError;
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
 * Generate compact summary for chat agent analysis
 */
function generateComprehensiveSummary(result: ScanResult) {
  const security = generateSecuritySummary(result);

  return {
    // Security Assessment (most important)
    malicious: security.malicious,
    riskLevel: security.riskLevel,
    securityScore: security.score,
    threats: security.threats, // Keep all threats - they're important

    // Essential Site Information
    domain: result.page?.domain || result.task?.domain,
    finalUrl: result.page?.url || result.task?.url,

    // All Technologies (important for security analysis)
    technologies:
      result.meta?.processors?.wappa?.data?.map((tech: any) => ({
        name: tech.app,
        confidence: tech.confidenceTotal || 0,
        categories: tech.categories?.map((cat: any) => cat.name) || [],
      })) || [],

    // Critical scan metadata
    scanId: result.task?.uuid,
    scanTime: result.task?.time,
  };
}

async function runCloudflareUrlScan(
  url: string,
  visibility: ScanVisibility = DEFAULT_VISIBILITY,
  screenshotResolutions: ScreenshotResolution[] = DEFAULT_SCREENSHOT_RESOLUTIONS,
  customHeaders?: Record<string, string>,
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
      hasCustomHeaders: !!customHeaders,
    });

    // First, search for recent scans of this URL
    const searchQuery = `task.url:"${normalizedUrl}"`;

    Sentry.logger.info("Searching for recent scans before submission", {
      url: normalizedUrl,
      searchQuery,
    });

    let scanId: string;
    let scanUrl: string;
    let isRecentScan = false;

    try {
      const searchResults = await client.searchScans({
        query: searchQuery,
        limit: 1,
      });

      if (searchResults.results.length > 0) {
        // Found a recent scan, use it
        const recentResult = searchResults.results[0];
        scanId = recentResult.task.uuid;
        scanUrl = recentResult.result;
        isRecentScan = true;

        Sentry.logger.info("Using recent scan found via search", {
          scanId,
          scanTime: recentResult.task.time,
          age: Date.now() - new Date(recentResult.task.time).getTime(),
          malicious: recentResult.verdicts.malicious,
        });
      } else {
        // No recent scan found, submit a new one
        Sentry.logger.info("No recent scan found, submitting new scan", {
          url: normalizedUrl,
        });

        const submission = await client.submitScan({
          url: normalizedUrl,
          visibility,
          screenshotsResolutions: screenshotResolutions,
          customHeaders,
        });

        // Handle both new scan and recently scanned responses
        // Check if this is a RecentScanResponse (409) by checking for the specific structure
        if (
          "result" in submission &&
          typeof (submission as any).result === "object" &&
          "tasks" in (submission as any).result
        ) {
          // Recently scanned - extract existing scan UUID
          const recentScan = submission as RecentScanResponse;
          scanId = recentScan.result.tasks[0].uuid;
          scanUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/urlscanner/v2/result/${scanId}`;
          isRecentScan = true;

          Sentry.logger.info("Using recent scan from API 409 response", {
            scanId,
            message: recentScan.message,
          });
        } else {
          // New scan created
          const newScan = submission as ScanSubmissionResponse;
          scanId = newScan.uuid;
          scanUrl = newScan.api;

          Sentry.logger.info("New scan submitted", {
            scanId,
            message: newScan.message,
          });
        }
      }
    } catch (searchError) {
      Sentry.logger.warn("Search failed, falling back to direct submission", {
        error:
          searchError instanceof Error ? searchError.message : "Unknown error",
        url: normalizedUrl,
      });

      // Search failed, fall back to direct submission
      const submission = await client.submitScan({
        url: normalizedUrl,
        visibility,
        screenshotsResolutions: screenshotResolutions,
        customHeaders,
      });

      // Handle response as before
      if (
        "result" in submission &&
        typeof (submission as any).result === "object" &&
        "tasks" in (submission as any).result
      ) {
        const recentScan = submission as RecentScanResponse;
        scanId = recentScan.result.tasks[0].uuid;
        scanUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/urlscanner/v2/result/${scanId}`;
        isRecentScan = true;

        Sentry.logger.info("Fallback got recent scan (409)", { scanId });
      } else {
        const newScan = submission as ScanSubmissionResponse;
        scanId = newScan.uuid;
        scanUrl = newScan.api;

        Sentry.logger.info("Fallback created new scan", { scanId });
      }
    }

    // Smart result fetching: always try to get results intelligently
    let result: ScanResult | undefined;

    try {
      result = await client.getScanResult(scanId);

      if (result?.task?.success === true) {
        Sentry.logger.info("Scan completed immediately", {
          scanId,
          malicious: result.verdicts?.overall?.malicious,
        });
      } else {
        // Not complete yet, start polling
        Sentry.logger.debug("Scan incomplete, starting polling", {
          scanId,
          success: result?.task?.success,
        });
        result = await client.waitForScanCompletion(scanId);
      }
    } catch (error) {
      // If 404 or similar, start polling (scan not ready yet)
      if (
        error instanceof Error &&
        (error.message.includes("404") ||
          error.message.includes("not found") ||
          error.message.includes("not ready"))
      ) {
        Sentry.logger.debug("Scan not ready, starting polling", { scanId });
        result = await client.waitForScanCompletion(scanId);
      } else {
        throw error;
      }
    }

    // Determine status based on scan results
    const status: ScanStatus =
      result?.task?.success === true
        ? "finished"
        : result?.task?.success === false
          ? "failed"
          : "queued";

    // Generate compact summary without the massive full result
    const summary = result ? generateComprehensiveSummary(result) : undefined;

    const output: CloudflareScannerToolOutput = {
      scanId,
      scanUrl,
      status,
      // Remove the full result to avoid context length issues
      result: undefined,
      summary: summary
        ? {
            ...summary,
            isRecentScan,
          }
        : undefined,
    };

    Sentry.logger.info("Cloudflare URL Scanner analysis completed", {
      url: normalizedUrl,
      scanId,
      status: output.status,
      isRecentScan,
      malicious: result?.verdicts?.overall?.malicious,
      riskLevel: output.summary?.riskLevel,
      securityScore: output.summary?.securityScore,
      threatCount: output.summary?.threats?.length || 0,
      techCount: output.summary?.technologies?.length || 0,
    });

    return output;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    Sentry.captureException(error, {
      tags: {
        component: "cloudflare-scanner",
        operation: "runCloudflareUrlScan",
      },
      extra: {
        url: normalizedUrl,
        visibility,
        hasCustomHeaders: !!customHeaders,
      },
    });

    throw new Error(`Cloudflare URL Scanner analysis failed: ${errorMessage}`);
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
    Sentry.logger.info("Starting Cloudflare URL Scanner search", {
      query,
      limit,
      offset,
    });

    const results = await client.searchScans({ query, limit, offset });

    Sentry.logger.info("Cloudflare URL Scanner search completed", {
      query,
      resultCount: results.results.length,
      maliciousCount: results.results.filter((r) => r.verdicts.malicious)
        .length,
    });

    return results;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    Sentry.captureException(error, {
      tags: {
        component: "cloudflare-scanner",
        operation: "searchCloudflareScans",
      },
      extra: { query, limit, offset },
    });

    throw new Error(`Cloudflare URL Scanner search failed: ${errorMessage}`);
  }
}

export const cloudflareUrlScannerTool = tool({
  description:
    "Analyze URLs for security threats, malware, and phishing using Cloudflare's URL Scanner. Intelligently handles scan submission - uses existing recent scans when available or creates new ones. Automatically waits for completion and provides comprehensive security analysis including threats, network behavior, technology stack, and security scores.",
  inputSchema: cloudflareScantoolInputSchema,
  execute: async ({
    url,
    visibility,
    screenshotResolutions,
    customHeaders,
  }) => {
    return await runCloudflareUrlScan(
      url,
      visibility,
      screenshotResolutions,
      customHeaders,
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

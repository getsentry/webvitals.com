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
  private pollAttempts = 0;

  constructor(accountId: string, apiToken: string) {
    this.apiToken = apiToken;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/urlscanner/v2`;
  }

  getPollAttempts(): number {
    return this.pollAttempts;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries = 5,
    maxRetryTime = 120000,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const startTime = Date.now();
    let attempt = 0;

    while (attempt < maxRetries) {
      const response = await fetch(url, {
        ...options,
        headers,
        next: {
          revalidate: 3600,
          tags: [`cloudflare:${endpoint}`],
        },
      });

      if (!response.ok) {
        let errorData: any;
        let errorMessage = response.statusText;

        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            errorData = await response.json();
            errorMessage = errorData.message || response.statusText;
          } else {
            const textResponse = await response.text();
            Sentry.logger.warn("Non-JSON error response from Cloudflare", {
              status: response.status,
              contentType,
              responsePreview: textResponse.substring(0, 200),
            });
            errorMessage = `${response.statusText} (non-JSON response)`;
          }
        } catch (parseError) {
          Sentry.logger.warn("Failed to parse error response", {
            status: response.status,
            error:
              parseError instanceof Error ? parseError.message : "Unknown error",
          });
          errorMessage = response.statusText;
        }

        if (response.status === 409 && errorData?.result?.tasks) {
          return errorData as T;
        }

        if (response.status === 404) {
          throw new Error("Scan not ready");
        }

        if (response.status === 429) {
          attempt++;
          const elapsedTime = Date.now() - startTime;

          if (attempt >= maxRetries || elapsedTime >= maxRetryTime) {
            throw new Error(
              `Cloudflare API error ${response.status}: ${errorMessage}`,
            );
          }

          const delay = Math.min(1000 * 2 ** attempt, 30000);
          Sentry.logger.warn("Rate limited by Cloudflare, retrying", {
            attempt,
            delay,
            elapsedTime,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw new Error(
          `Cloudflare API error ${response.status}: ${errorMessage}`,
        );
      }

      return response.json();
    }

    throw new Error("Max retries exceeded");
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
        screenshotsResolutions: [],
      }),
    });
  }

  async getScanResult(scanId: string): Promise<CloudflareScanResult> {
    return this.makeRequest<CloudflareScanResult>(`/result/${scanId}`);
  }

  async waitForScanCompletion(
    scanId: string,
    maxWaitTime = 180000, // 3 minutes
    pollInterval = 10000, // 10 seconds (per docs recommendation)
  ): Promise<CloudflareScanResult> {
    const startTime = Date.now();
    this.pollAttempts = 0;

    while (Date.now() - startTime < maxWaitTime) {
      this.pollAttempts++;
      const elapsedTime = Date.now() - startTime;

      try {
        const result = await this.getScanResult(scanId);

        Sentry.logger.info("Scan status check", {
          scanId,
          attempt: this.pollAttempts,
          elapsedTime,
          status: result?.task?.status,
          success: result?.task?.success,
        });

        if (result?.task?.success === true) {
          Sentry.logger.info("Scan completed successfully", {
            scanId,
            totalTime: elapsedTime,
            attempts: this.pollAttempts,
          });
          return result;
        }
        if (result?.task?.success === false) {
          throw new Error("Scan failed");
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Scan not ready") {
          Sentry.logger.info("Scan still in progress", {
            scanId,
            attempt: this.pollAttempts,
            elapsedTime,
            remainingTime: maxWaitTime - elapsedTime,
          });
          // Continue to wait
        } else {
          throw error;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(
      `Scan did not complete within ${maxWaitTime}ms (${this.pollAttempts} attempts)`,
    );
  }
}

async function detectTechnologies(url: string): Promise<TechDetectionOutput> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  return Sentry.startSpan(
    {
      name: "webvitals.cloudflare.detectTechnologies",
      op: "tool.execute",
      attributes: {
        "webvitals.cloudflare.url": normalizedUrl,
      },
    },
    async (span) => {
      const startTime = Date.now();
      let existingScanFound = false;
      let pollAttempts = 0;
      let techCount = 0;

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

        // Search for existing scans
        try {
          Sentry.logger.info("Searching for existing scans", {
            url: normalizedUrl,
            query: searchQuery,
          });

          const searchResults = await Sentry.startSpan(
            {
              name: "webvitals.cloudflare.search",
              op: "http.client",
              attributes: {
                "webvitals.cloudflare.url": normalizedUrl,
              },
            },
            async () => {
              return client.searchScans(searchQuery);
            },
          );

          Sentry.logger.info("Search results", {
            url: normalizedUrl,
            resultCount: searchResults.results?.length || 0,
            hasResults: searchResults.results && searchResults.results.length > 0,
          });

          if (searchResults.results?.length > 0) {
            existingScanFound = true;
            span.addEvent("existing_scan_found");

            const recentResult = searchResults.results[0];
            const scanId = recentResult.task.uuid;

            Sentry.logger.info("Found existing scan", {
              scanId,
              scanUrl: recentResult.task.url,
              scanStatus: recentResult.task.status,
            });

            try {
              scanResult = await client.getScanResult(scanId);
              Sentry.logger.info("Retrieved existing scan result", {
                scanId,
                hasWappaData: !!scanResult?.meta?.processors?.wappa?.data,
                techCount: scanResult?.meta?.processors?.wappa?.data?.length || 0,
              });
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
              searchError instanceof Error
                ? searchError.message
                : "Unknown error",
          });
        }

        // Submit new scan if needed
        if (!scanResult?.meta?.processors?.wappa?.data) {
          Sentry.logger.info(
            "No existing scan with tech data, submitting new scan",
            {
              url: normalizedUrl,
            },
          );

          const submission = await Sentry.startSpan(
            {
              name: "webvitals.cloudflare.submit",
              op: "http.client",
              attributes: {
                "webvitals.cloudflare.url": normalizedUrl,
              },
            },
            async () => {
              return client.submitScan(normalizedUrl);
            },
          );

          let scanId: string;

          if (submission.result?.tasks) {
            scanId = submission.result.tasks[0].uuid;
          } else if (submission.uuid) {
            scanId = submission.uuid;
          } else {
            throw new Error("Failed to get scan ID from submission");
          }

          span.setAttribute("webvitals.cloudflare.scan_id", scanId);

          Sentry.logger.info("Scan submitted", {
            scanId,
            url: normalizedUrl,
            visibility: submission.visibility,
          });

          try {
            scanResult = await client.getScanResult(scanId);

            // Check if scan is still in progress (not finished yet)
            const isStillProcessing =
              scanResult?.task?.status &&
              !["finished", "failed", "complete"].includes(
                scanResult.task.status.toLowerCase(),
              );

            if (scanResult?.task?.success !== true && isStillProcessing) {
              Sentry.logger.info("Scan not complete, starting to poll", {
                scanId,
                status: scanResult?.task?.status,
              });

              span.addEvent("starting_poll");

              scanResult = await Sentry.startSpan(
                {
                  name: "webvitals.cloudflare.poll",
                  op: "cloudflare.api",
                  attributes: {
                    "webvitals.cloudflare.scan_id": scanId,
                  },
                },
                async (pollSpan) => {
                  const pollStartTime = Date.now();
                  const result = await client.waitForScanCompletion(scanId);
                  pollAttempts = client.getPollAttempts();

                  const pollDurationMs = Date.now() - pollStartTime;
                  pollSpan.setAttribute(
                    "webvitals.cloudflare.poll_attempts",
                    pollAttempts,
                  );
                  pollSpan.setAttribute(
                    "webvitals.cloudflare.poll_duration_ms",
                    pollDurationMs,
                  );

                  Sentry.metrics.distribution(
                    "webvitals.cloudflare.poll_duration_ms",
                    pollDurationMs,
                    {
                      unit: "millisecond",
                      attributes: {
                        poll_attempts: String(pollAttempts),
                      },
                    },
                  );

                  return result;
                },
              );
            }
          } catch (error) {
            if (error instanceof Error && error.message === "Scan not ready") {
              Sentry.logger.info("Scan not ready, starting to poll", { scanId });
              span.addEvent("starting_poll");

              scanResult = await Sentry.startSpan(
                {
                  name: "webvitals.cloudflare.poll",
                  op: "cloudflare.api",
                  attributes: {
                    "webvitals.cloudflare.scan_id": scanId,
                  },
                },
                async (pollSpan) => {
                  const pollStartTime = Date.now();
                  const result = await client.waitForScanCompletion(scanId);
                  pollAttempts = client.getPollAttempts();

                  const pollDurationMs = Date.now() - pollStartTime;
                  pollSpan.setAttribute(
                    "webvitals.cloudflare.poll_attempts",
                    pollAttempts,
                  );
                  pollSpan.setAttribute(
                    "webvitals.cloudflare.poll_duration_ms",
                    pollDurationMs,
                  );

                  Sentry.metrics.distribution(
                    "webvitals.cloudflare.poll_duration_ms",
                    pollDurationMs,
                    {
                      unit: "millisecond",
                      attributes: {
                        poll_attempts: String(pollAttempts),
                      },
                    },
                  );

                  return result;
                },
              );
            } else {
              throw error;
            }
          }
        }

        if (!scanResult || !scanResult.task?.success) {
          // Check if there are specific error details from Cloudflare
          const cloudflareErrors = scanResult?.task?.errors || [];
          const firstError = cloudflareErrors[0];

          const errorContext = {
            hasScanResult: !!scanResult,
            taskExists: !!scanResult?.task,
            taskSuccess: scanResult?.task?.success,
            taskStatus: scanResult?.task?.status,
            taskUuid: scanResult?.task?.uuid,
            cloudflareErrors,
          };

          // Determine the specific failure reason
          let errorMessage = "Failed to scan website for technology detection.";

          if (firstError) {
            // Use the actual Cloudflare error message
            if (firstError.code === 1015) {
              // Rate limit error
              errorMessage = `Cloudflare rate limit exceeded: ${firstError.message}`;
            } else {
              errorMessage = `Cloudflare scan error: ${firstError.message}`;
              if (firstError.name) {
                errorMessage += ` (${firstError.name})`;
              }
            }
          } else if (!scanResult) {
            errorMessage += " No scan result returned.";
          } else if (
            scanResult.task?.status === "finished" &&
            scanResult.task?.success === false
          ) {
            errorMessage +=
              " Cloudflare scan completed but failed. This can happen if the website blocks automated scanning, returns errors, or is unreachable.";
          } else if (scanResult.task?.status === "failed") {
            errorMessage +=
              " Cloudflare scan failed. The website may be blocking automated requests.";
          } else {
            errorMessage += ` Status: ${scanResult.task?.status || "unknown"}, Success: ${scanResult.task?.success}`;
          }

          Sentry.captureException(new Error(errorMessage), {
            tags: {
              component: "tech-detection-tool",
              operation: "detectTechnologies",
            },
            extra: { url: normalizedUrl, ...errorContext },
          });
          throw new Error(errorMessage);
        }

        const wappaData = scanResult?.meta?.processors?.wappa?.data || [];

        const technologies = wappaData.map((tech: CloudflareTechnology) => ({
          name: tech.app,
          confidence: tech.confidenceTotal || 0,
          categories: tech.categories?.map((cat) => cat.name) || [],
        }));

        techCount = technologies.length;

        const result: TechDetectionOutput = {
          technologies: technologies.sort((a, b) => b.confidence - a.confidence),
        };

        const durationMs = Date.now() - startTime;

        span.setAttributes({
          "webvitals.cloudflare.existing_scan_found": existingScanFound,
          "webvitals.cloudflare.poll_attempts": pollAttempts,
          "webvitals.cloudflare.tech_count": techCount,
          "webvitals.cloudflare.duration_ms": durationMs,
          "webvitals.cloudflare.success": true,
        });

        // Track overall tech detection duration
        Sentry.metrics.distribution(
          "webvitals.cloudflare.duration_ms",
          durationMs,
          {
            unit: "millisecond",
            attributes: {
              existing_scan_found: String(existingScanFound),
              poll_attempts: String(pollAttempts),
              success: "true",
            },
          },
        );

        // Track number of detected technologies
        Sentry.metrics.distribution("webvitals.tech.count", techCount, {
          unit: "none",
          attributes: {
            url: normalizedUrl,
          },
        });

        Sentry.logger.info("Technology detection completed", {
          url: normalizedUrl,
          techCount,
          scanId: scanResult.task?.uuid,
          existingScanFound,
          pollAttempts,
          durationMs,
        });

        return result;
      } catch (error) {
        const durationMs = Date.now() - startTime;

        span.setAttributes({
          "webvitals.cloudflare.existing_scan_found": existingScanFound,
          "webvitals.cloudflare.poll_attempts": pollAttempts,
          "webvitals.cloudflare.duration_ms": durationMs,
          "webvitals.cloudflare.success": false,
          "webvitals.cloudflare.error":
            error instanceof Error ? error.message : "Unknown",
        });

        Sentry.metrics.distribution(
          "webvitals.cloudflare.duration_ms",
          durationMs,
          {
            unit: "millisecond",
            attributes: {
              existing_scan_found: String(existingScanFound),
              poll_attempts: String(pollAttempts),
              success: "false",
            },
          },
        );

        Sentry.logger.error("Technology detection failed", {
          url: normalizedUrl,
          error: error instanceof Error ? error.message : "Unknown error",
          durationMs,
        });

        Sentry.captureException(error, {
          tags: {
            component: "tech-detection-tool",
            operation: "detectTechnologies",
          },
          extra: { url: normalizedUrl },
        });

        throw error;
      }
    },
  );
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

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type {
  FieldMetrics,
  PerformanceCategory,
  RealWorldPerformanceOutput,
} from "@/types/real-world-performance";

const realWorldPerformanceInputSchema = z.object({
  url: z.string().describe("The URL to analyze for real-world performance"),
  devices: z
    .array(z.enum(["mobile", "desktop"]))
    .optional()
    .describe("Devices to analyze (default: both mobile and desktop)"),
});

async function fetchPerformanceData(
  url: string,
  strategy: "mobile" | "desktop",
  apiKey: string,
) {
  return Sentry.startSpan(
    {
      name: "webvitals.crux.fetch",
      op: "http.client",
      attributes: {
        "webvitals.crux.url": url,
        "webvitals.crux.strategy": strategy,
      },
    },
    async (span) => {
      const startTime = Date.now();

      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url,
      )}&strategy=${strategy}&fields=loadingExperience&key=${apiKey}`;

      try {
        const response = await fetch(apiUrl, {
          signal: AbortSignal.timeout(120000),
          next: {
            revalidate: 3600,
            tags: [`crux:${strategy}:${url}`],
          },
        });

        const durationMs = Date.now() - startTime;
        const cacheHit = response.headers.get("x-vercel-cache") === "HIT";

        span.setAttributes({
          "http.status_code": response.status,
          "webvitals.crux.cache_hit": cacheHit,
          "webvitals.crux.duration_ms": durationMs,
        });

        // Track CrUX fetch duration
        Sentry.metrics.distribution("webvitals.crux.duration_ms", durationMs, {
          unit: "millisecond",
          attributes: {
            strategy,
            cache_hit: String(cacheHit),
            success: String(response.ok),
          },
        });

        if (!response.ok) {
          if (response.status === 400) {
            throw new Error(
              `CrUX API failed for ${strategy} (${response.status}): URL may be invalid, not in CrUX dataset, or contains query parameters. URL: ${url}`,
            );
          }
          throw new Error(
            `CrUX API failed for ${strategy}: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        Sentry.logger.info(`CrUX API response for ${strategy}`, {
          url,
          strategy,
          durationMs,
          cacheHit,
          hasLoadingExperience: !!data.loadingExperience,
          metricsKeys: data.loadingExperience?.metrics
            ? Object.keys(data.loadingExperience.metrics)
            : [],
          overallCategory: data.loadingExperience?.overall_category,
        });

        return data;
      } catch (error) {
        const durationMs = Date.now() - startTime;

        span.setAttributes({
          "webvitals.crux.error": true,
          "webvitals.crux.error_message":
            error instanceof Error ? error.message : "Unknown",
          "webvitals.crux.duration_ms": durationMs,
        });

        Sentry.metrics.distribution("webvitals.crux.duration_ms", durationMs, {
          unit: "millisecond",
          attributes: {
            strategy,
            success: "false",
          },
        });

        throw error;
      }
    },
  );
}

function transformMetrics(rawMetrics: Record<string, unknown>): FieldMetrics {
  const result: FieldMetrics = {};

  const fieldMapping: Record<string, keyof FieldMetrics> = {
    FIRST_CONTENTFUL_PAINT: "first_contentful_paint",
    FIRST_CONTENTFUL_PAINT_MS: "first_contentful_paint",
    LARGEST_CONTENTFUL_PAINT: "largest_contentful_paint",
    LARGEST_CONTENTFUL_PAINT_MS: "largest_contentful_paint",
    CUMULATIVE_LAYOUT_SHIFT: "cumulative_layout_shift",
    CUMULATIVE_LAYOUT_SHIFT_SCORE: "cumulative_layout_shift",
    INTERACTION_TO_NEXT_PAINT: "interaction_to_next_paint",
    EXPERIMENTAL_TIME_TO_FIRST_BYTE: "experimental_time_to_first_byte",
    FIRST_INPUT_DELAY: "first_input_delay",
  };

  for (const [apiKey, fieldKey] of Object.entries(fieldMapping)) {
    const rawMetric = rawMetrics[apiKey];
    if (rawMetric && typeof rawMetric === "object") {
      const metric = rawMetric as {
        percentile: number;
        category: PerformanceCategory;
        distributions?: Array<{ min: number; max: number; proportion: number }>;
      };
      result[fieldKey] = {
        percentile: metric.percentile,
        category: metric.category,
        distributions: metric.distributions || [],
      };
    }
  }

  return result;
}

async function getRealWorldPerformance(
  url: string,
  devices: Array<"mobile" | "desktop"> = ["mobile", "desktop"],
): Promise<RealWorldPerformanceOutput> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  return Sentry.startSpan(
    {
      name: "webvitals.crux.getRealWorldPerformance",
      op: "tool.execute",
      attributes: {
        "webvitals.crux.url": normalizedUrl,
        "webvitals.crux.devices": devices.join(","),
      },
    },
    async (span) => {
      const startTime = Date.now();

      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error("Google API key is required for CrUX data");
      }

      try {
        const promises: Promise<unknown>[] = [];
        const deviceOrder: Array<"mobile" | "desktop"> = [];

        if (devices.includes("mobile")) {
          promises.push(fetchPerformanceData(normalizedUrl, "mobile", apiKey));
          deviceOrder.push("mobile");
        }

        if (devices.includes("desktop")) {
          promises.push(fetchPerformanceData(normalizedUrl, "desktop", apiKey));
          deviceOrder.push("desktop");
        }

        const results = await Promise.allSettled(promises);

        // Track errors for better error messages
        const errors: { device: string; error: string }[] = [];

        const mobileData = deviceOrder.includes("mobile")
          ? (() => {
              const mobileResult = results[deviceOrder.indexOf("mobile")];
              if (mobileResult.status === "fulfilled") {
                return mobileResult.value as {
                  loadingExperience?: {
                    overall_category: PerformanceCategory;
                    metrics?: Record<string, unknown>;
                  };
                };
              }
              const errorMessage =
                mobileResult.reason instanceof Error
                  ? mobileResult.reason.message
                  : "Unknown error";
              errors.push({ device: "mobile", error: errorMessage });
              Sentry.logger.warn("Mobile CrUX data fetch failed", {
                url: normalizedUrl,
                error: errorMessage,
              });
              Sentry.captureException(mobileResult.reason, {
                tags: {
                  component: "real-world-performance-tool",
                  operation: "fetchPerformanceData",
                  strategy: "mobile",
                },
                extra: { url: normalizedUrl },
              });
              return null;
            })()
          : null;

        const desktopData = deviceOrder.includes("desktop")
          ? (() => {
              const desktopResult = results[deviceOrder.indexOf("desktop")];
              if (desktopResult.status === "fulfilled") {
                return desktopResult.value as {
                  loadingExperience?: {
                    overall_category: PerformanceCategory;
                    metrics?: Record<string, unknown>;
                  };
                };
              }
              const errorMessage =
                desktopResult.reason instanceof Error
                  ? desktopResult.reason.message
                  : "Unknown error";
              errors.push({ device: "desktop", error: errorMessage });
              Sentry.logger.warn("Desktop CrUX data fetch failed", {
                url: normalizedUrl,
                error: errorMessage,
              });
              Sentry.captureException(desktopResult.reason, {
                tags: {
                  component: "real-world-performance-tool",
                  operation: "fetchPerformanceData",
                  strategy: "desktop",
                },
                extra: { url: normalizedUrl },
              });
              return null;
            })()
          : null;

        const result: RealWorldPerformanceOutput = {
          url: normalizedUrl,
          hasData: false,
          mobile: {},
          desktop: {},
        };

        if (mobileData?.loadingExperience) {
          const metrics = transformMetrics(
            mobileData.loadingExperience.metrics || {},
          );
          Sentry.logger.info("Mobile metrics transformed", {
            url: normalizedUrl,
            metricsCount: Object.keys(metrics).length,
            metricKeys: Object.keys(metrics),
            overallCategory: mobileData.loadingExperience.overall_category,
          });
          if (Object.keys(metrics).length > 0) {
            if (!result.mobile) result.mobile = {};
            result.mobile.fieldData = {
              overallCategory: mobileData.loadingExperience.overall_category,
              metrics,
            };
            result.hasData = true;
          }
        }

        if (desktopData?.loadingExperience) {
          const metrics = transformMetrics(
            desktopData.loadingExperience.metrics || {},
          );
          Sentry.logger.info("Desktop metrics transformed", {
            url: normalizedUrl,
            metricsCount: Object.keys(metrics).length,
            metricKeys: Object.keys(metrics),
            overallCategory: desktopData.loadingExperience.overall_category,
          });
          if (Object.keys(metrics).length > 0) {
            if (!result.desktop) result.desktop = {};
            result.desktop.fieldData = {
              overallCategory: desktopData.loadingExperience.overall_category,
              metrics,
            };
            result.hasData = true;
          }
        }

        const hasMobileData = !!result.mobile?.fieldData;
        const hasDesktopData = !!result.desktop?.fieldData;
        const requestedBothDevices =
          devices.includes("mobile") && devices.includes("desktop");
        const requestedOnlyMobile =
          devices.includes("mobile") && !devices.includes("desktop");
        const requestedOnlyDesktop =
          !devices.includes("mobile") && devices.includes("desktop");

        // Only throw if we had actual API errors (not just empty metrics)
        const hasActualErrors = errors.length > 0;

        if (
          hasActualErrors &&
          ((requestedBothDevices && !hasMobileData && !hasDesktopData) ||
            (requestedOnlyMobile && !hasMobileData) ||
            (requestedOnlyDesktop && !hasDesktopData))
        ) {
          const errorDetails = errors
            .map((e) => `${e.device}: ${e.error}`)
            .join(", ");
          throw new Error(
            `Failed to fetch CrUX data for all requested devices. ${errorDetails}`,
          );
        }

        const durationMs = Date.now() - startTime;

        span.setAttributes({
          "webvitals.crux.has_mobile_data": hasMobileData,
          "webvitals.crux.has_desktop_data": hasDesktopData,
          "webvitals.crux.has_data": result.hasData,
          "webvitals.crux.duration_ms": durationMs,
        });

        // Track when CrUX has no data for a domain
        if (!result.hasData) {
          Sentry.metrics.count("webvitals.crux.no_data", 1, {
            attributes: {
              devices: devices.join(","),
            },
          });
        }

        Sentry.logger.info("Real-world performance data fetched", {
          url: normalizedUrl,
          hasMobileData,
          hasDesktopData,
          hasData: result.hasData,
          requestedDevices: devices,
          durationMs,
        });

        return result;
      } catch (error) {
        const durationMs = Date.now() - startTime;

        span.setAttributes({
          "webvitals.crux.error": true,
          "webvitals.crux.error_message":
            error instanceof Error ? error.message : "Unknown",
          "webvitals.crux.duration_ms": durationMs,
        });

        Sentry.logger.error("Real-world performance fetch failed", {
          url: normalizedUrl,
          error: error instanceof Error ? error.message : "Unknown error",
          durationMs,
        });

        Sentry.captureException(error, {
          tags: {
            component: "real-world-performance-tool",
            operation: "getRealWorldPerformance",
          },
          extra: { url: normalizedUrl },
        });

        throw error;
      }
    },
  );
}

export const realWorldPerformanceTool = tool({
  description:
    "Get real-world performance data (Core Web Vitals) from actual users via Chrome User Experience Report (CrUX). Supports configurable device analysis (mobile, desktop, or both). Returns field data with Sentry-style performance scores. No synthetic/lab tests.",
  inputSchema: realWorldPerformanceInputSchema,
  execute: async (input) => {
    const { url, devices } = input;
    if (!url) {
      throw new Error("URL is required for real-world performance analysis");
    }
    return getRealWorldPerformance(url, devices);
  },
});

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
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url,
  )}&strategy=${strategy}&fields=loadingExperience,originLoadingExperience&key=${apiKey}`;

  const response = await fetch(apiUrl, {
    next: {
      revalidate: 3600, // 1 hour cache
      tags: [`crux:${strategy}:${url}`],
    },
  });

  if (!response.ok) {
    throw new Error(
      `CrUX API failed for ${strategy}: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data;
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

    const results = await Promise.all(promises);
    const mobileData = deviceOrder.includes("mobile")
      ? (results[deviceOrder.indexOf("mobile")] as {
          loadingExperience?: {
            overall_category: PerformanceCategory;
            metrics?: Record<string, unknown>;
          };
        })
      : null;
    const desktopData = deviceOrder.includes("desktop")
      ? (results[deviceOrder.indexOf("desktop")] as {
          loadingExperience?: {
            overall_category: PerformanceCategory;
            metrics?: Record<string, unknown>;
          };
        })
      : null;

    const result: RealWorldPerformanceOutput = {
      url: normalizedUrl,
      hasData: false,
      mobile: {},
      desktop: {},
    };

    if (mobileData?.loadingExperience) {
      if (!result.mobile) result.mobile = {};
      result.mobile.fieldData = {
        overallCategory: mobileData.loadingExperience.overall_category,
        metrics: transformMetrics(mobileData.loadingExperience.metrics || {}),
      };
      result.hasData = true;
    }

    if (desktopData?.loadingExperience) {
      if (!result.desktop) result.desktop = {};
      result.desktop.fieldData = {
        overallCategory: desktopData.loadingExperience.overall_category,
        metrics: transformMetrics(desktopData.loadingExperience.metrics || {}),
      };
      result.hasData = true;
    }

    Sentry.logger.info("Real-world performance data fetched", {
      url: normalizedUrl,
      hasMobileData: !!result.mobile?.fieldData,
      hasDesktopData: !!result.desktop?.fieldData,
    });

    return result;
  } catch (error) {
    Sentry.logger.error("Real-world performance fetch failed", {
      url: normalizedUrl,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    Sentry.captureException(error, {
      tags: {
        component: "real-world-performance-tool",
        operation: "getRealWorldPerformance",
      },
      extra: { url: normalizedUrl },
    });

    throw new Error(
      `Real-world performance analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
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


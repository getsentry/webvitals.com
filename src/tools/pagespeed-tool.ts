import * as Sentry from "@sentry/astro";
import { tool } from "ai";
import { z } from "zod";

// PageSpeed Insights input schema
const pageSpeedInputSchema = z.object({
  url: z.string().describe("The URL to analyze (with or without protocol)"),
  strategy: z
    .enum(["mobile", "desktop"])
    .optional()
    .default("desktop")
    .describe("Analysis strategy - mobile or desktop"),
  categories: z
    .array(
      z.enum(["performance", "accessibility", "best-practices", "seo", "pwa"])
    )
    .optional()
    .default(["performance", "accessibility", "best-practices", "seo"])
    .describe("Categories to analyze"),
});

async function runPageSpeedAnalysis(
  url: string,
  strategy: "mobile" | "desktop" = "desktop",
  categories: string[] = [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
  ]
) {
  // Normalize URL
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  try {
    console.log(
      `🚀 Starting PageSpeed Insights analysis for: ${normalizedUrl}`
    );
    console.log(
      `📱 Strategy: ${strategy}, 📊 Categories: ${categories.join(", ")}`
    );

    // Use authenticated Google PageSpeed Insights API

    // Map categories to proper PageSpeed Insights format (lowercase as per API spec)
    const validCategories = categories.filter((cat) =>
      ["performance", "accessibility", "best-practices", "seo", "pwa"].includes(
        cat
      )
    );

    const categoryParams = validCategories
      .map((cat) => `category=${cat}`)
      .join("&");

    // Get API key from Astro environment
    const apiKey = import.meta.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("Google API key is required for PageSpeed Insights API");
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      normalizedUrl
    )}&strategy=${strategy}&${categoryParams}&key=${apiKey}`;

    console.log("API URL:", apiUrl.replace(apiKey, "REDACTED_KEY"));
    console.log("Calling authenticated PageSpeed Insights API...");

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `PageSpeed Insights API failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("📊 PageSpeed Insights API response received");
    Sentry.logger.info("PageSpeed Insights API response received", { data });
    console.log("Available data types:", Object.keys(data));

    // Extract all three types of PageSpeed Insights data
    const fieldData = data.loadingExperience;
    const originData = data.originLoadingExperience;
    const labData = data.lighthouseResult;

    console.log("Field Data (Real Users):", !!fieldData);
    console.log("Origin Data (Domain-wide):", !!originData);
    console.log("Lab Data (Synthetic):", !!labData);

    // 1. FIELD DATA - Real User Experience (Chrome UX Report)
    const realUserExperience = fieldData
      ? {
          overallCategory: fieldData.overall_category,
          metrics: fieldData.metrics
            ? Object.entries(fieldData.metrics).reduce(
                (acc, [key, value]: [string, any]) => {
                  acc[key] = {
                    percentile: value.percentile,
                    category: value.category,
                    distributions: value.distributions,
                  };
                  return acc;
                },
                {} as Record<string, any>
              )
            : {},
          id: fieldData.id,
        }
      : null;

    // 2. ORIGIN DATA - Domain-wide Performance
    const originExperience = originData
      ? {
          overallCategory: originData.overall_category,
          metrics: originData.metrics
            ? Object.entries(originData.metrics).reduce(
                (acc, [key, value]: [string, any]) => {
                  acc[key] = {
                    percentile: value.percentile,
                    category: value.category,
                    distributions: value.distributions,
                  };
                  return acc;
                },
                {} as Record<string, any>
              )
            : {},
          id: originData.id,
        }
      : null;

    // 3. LAB DATA - Synthetic Testing (Lighthouse)
    const labResults = labData
      ? {
          scores: {
            performance: Math.round(
              (labData.categories?.performance?.score ?? 0) * 100
            ),
            accessibility: Math.round(
              (labData.categories?.accessibility?.score ?? 0) * 100
            ),
            "best-practices": Math.round(
              (labData.categories?.["best-practices"]?.score ?? 0) * 100
            ),
            seo: Math.round((labData.categories?.seo?.score ?? 0) * 100),
            pwa: Math.round((labData.categories?.pwa?.score ?? 0) * 100),
          },
          metrics: {
            "first-contentful-paint":
              labData.audits?.["first-contentful-paint"]?.numericValue ?? 0,
            "largest-contentful-paint":
              labData.audits?.["largest-contentful-paint"]?.numericValue ?? 0,
            "cumulative-layout-shift":
              labData.audits?.["cumulative-layout-shift"]?.numericValue ?? 0,
            "total-blocking-time":
              labData.audits?.["total-blocking-time"]?.numericValue ?? 0,
            "speed-index": labData.audits?.["speed-index"]?.numericValue ?? 0,
            interactive: labData.audits?.["interactive"]?.numericValue ?? 0,
          },
          opportunities: labData.audits
            ? Object.values(labData.audits)
                .filter(
                  (audit: any) =>
                    audit &&
                    typeof audit === "object" &&
                    audit.scoreDisplayMode === "numeric" &&
                    typeof audit.score === "number" &&
                    audit.score < 0.9
                )
                .map((audit: any) => ({
                  title: audit.title,
                  description: audit.description,
                  score: audit.score,
                  displayValue: audit.displayValue,
                }))
                .slice(0, 10)
            : [],
        }
      : null;

    // Comprehensive PageSpeed Insights result (optimized for AI analysis)
    const result = {
      url: normalizedUrl,
      strategy,
      timestamp: data.analysisUTCTimestamp || new Date().toISOString(),

      // Real user experience data (most valuable!)
      fieldData: realUserExperience,

      // Origin-wide performance data
      originData: originExperience,

      // Lab/synthetic testing data
      labData: labResults,

      // API metadata
      captchaResult: data.captchaResult,
      version: data.version?.major
        ? `${data.version.major}.${data.version.minor}`
        : "unknown",
    };

    console.log(
      `✅ PageSpeed Insights analysis completed for: ${normalizedUrl}`
    );
    console.log(
      `📊 Lab Performance Score: ${labResults?.scores.performance || "N/A"}/100`
    );
    console.log(
      `👥 Real User Experience: ${realUserExperience?.overallCategory || "N/A"}`
    );
    console.log(
      `🌐 Origin Performance: ${originExperience?.overallCategory || "N/A"}`
    );

    return result;
  } catch (error) {
    console.error("❌ PageSpeed Insights analysis error:", error);
    throw new Error(
      `PageSpeed Insights analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export const pageSpeedTool = tool({
  description:
    "Analyze website performance using Google PageSpeed Insights API. Provides comprehensive data including real user experience (field data), origin-wide performance metrics, and lab testing results. Much more valuable than basic Lighthouse analysis as it includes actual user experience data from Chrome UX Report.",
  inputSchema: pageSpeedInputSchema,
  execute: async ({ url, strategy, categories }) => {
    return await runPageSpeedAnalysis(url, strategy, categories);
  },
});

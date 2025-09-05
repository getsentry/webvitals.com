import * as Sentry from "@sentry/astro";
import { tool } from "ai";
import { z } from "zod";

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
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const validCategories = categories.filter((cat) =>
    ["performance", "accessibility", "best-practices", "seo", "pwa"].includes(
      cat
    )
  );

  try {
    Sentry.logger.info("Starting PageSpeed Insights analysis", {
      url: normalizedUrl,
      strategy,
      categories: validCategories,
    });

    const categoryParams = validCategories
      .map((cat) => `category=${cat}`)
      .join("&");

    const apiKey = import.meta.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("Google API key is required for PageSpeed Insights API");
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      normalizedUrl
    )}&strategy=${strategy}&${categoryParams}&key=${apiKey}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `PageSpeed Insights API failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    const fieldData = data.loadingExperience;
    const originData = data.originLoadingExperience;
    const labData = data.lighthouseResult;

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

    const result = {
      url: normalizedUrl,
      strategy,
      timestamp: data.analysisUTCTimestamp || new Date().toISOString(),
      fieldData: realUserExperience,
      originData: originExperience,
      labData: labResults,
      captchaResult: data.captchaResult,
      version: data.version?.major
        ? `${data.version.major}.${data.version.minor}`
        : "unknown",
    };

    Sentry.logger.info("PageSpeed Insights analysis completed", {
      url: normalizedUrl,
      strategy,
      performanceScore: labResults?.scores.performance,
      realUserExperience: realUserExperience?.overallCategory,
      originPerformance: originExperience?.overallCategory,
      hasFieldData: !!fieldData,
      hasOriginData: !!originData,
      hasLabData: !!labData,
    });

    return result;
  } catch (error) {
    Sentry.logger.error("PageSpeed Insights analysis failed", {
      url: normalizedUrl,
      strategy,
      categories: validCategories,
      error: error instanceof Error ? error.message : "Unknown error",
    });
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

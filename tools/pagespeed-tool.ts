import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type {
  CoreWebVitalMetric,
  PageSpeedCategory,
  PerformanceCategory,
} from "@/types/pagespeed";

const LIGHTHOUSE_THRESHOLDS = {
  "first-contentful-paint": { good: 1800, needsImprovement: 3000 },
  "speed-index": { good: 3400, needsImprovement: 5800 },
  "largest-contentful-paint": { good: 2500, needsImprovement: 4000 },
  "total-blocking-time": { good: 200, needsImprovement: 600 },
  "cumulative-layout-shift": { good: 0.1, needsImprovement: 0.25 },
} as const;

const LIGHTHOUSE_WEIGHTS = {
  "first-contentful-paint": 0.1,
  "speed-index": 0.1,
  "largest-contentful-paint": 0.25,
  "total-blocking-time": 0.3,
  "cumulative-layout-shift": 0.25,
} as const;

// Sentry Performance Score thresholds and weights (for future features)
const SENTRY_THRESHOLDS = {
  desktop: {
    "largest-contentful-paint": { good: 1200, needsImprovement: 2400 },
    "cumulative-layout-shift": { good: 0.1, needsImprovement: 0.25 },
    "first-contentful-paint": { good: 900, needsImprovement: 1600 },
    "time-to-first-byte": { good: 200, needsImprovement: 400 },
    "interaction-to-next-paint": { good: 200, needsImprovement: 500 },
  },
  mobile: {
    "largest-contentful-paint": { good: 2500, needsImprovement: 4000 },
    "cumulative-layout-shift": { good: 0.1, needsImprovement: 0.25 },
    "first-contentful-paint": { good: 1800, needsImprovement: 3000 },
    "time-to-first-byte": { good: 800, needsImprovement: 1800 },
    "interaction-to-next-paint": { good: 200, needsImprovement: 500 },
  },
};

const SENTRY_WEIGHTS = {
  "largest-contentful-paint": 0.3, // 30%
  "cumulative-layout-shift": 0.15, // 15%
  "first-contentful-paint": 0.15, // 15%
  "time-to-first-byte": 0.1, // 10%
  "interaction-to-next-paint": 0.3, // 30%
};

// Raw API response interfaces for the untyped data from PageSpeed Insights
interface RawMetricValue {
  percentile: number;
  category: PerformanceCategory;
  distributions: Array<{
    min: number;
    max?: number;
    proportion: number;
  }>;
}

interface RawFieldData {
  overall_category: string;
  metrics?: Record<string, RawMetricValue>;
  id: string;
}

interface LighthouseAudit {
  title: string;
  description: string;
  score: number;
  numericValue?: number;
  displayValue?: string;
  scoreDisplayMode: string;
}

// Valid PageSpeed Insights categories
const VALID_CATEGORIES: PageSpeedCategory[] = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
  "pwa",
];

const DEFAULT_CATEGORIES: PageSpeedCategory[] = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];

const pageSpeedInputSchema = z.object({
  url: z.string().describe("The URL to analyze (with or without protocol)"),
  strategy: z
    .enum(["mobile", "desktop"])
    .optional()
    .default("desktop")
    .describe("Analysis strategy - mobile or desktop"),
  categories: z
    .array(
      z.enum(["performance", "accessibility", "best-practices", "seo", "pwa"]),
    )
    .optional()
    .default(DEFAULT_CATEGORIES)
    .describe("Categories to analyze"),
});

// Helper function to transform raw metrics to typed format
function transformMetrics(
  metrics: Record<string, RawMetricValue>,
): Record<string, CoreWebVitalMetric> {
  return Object.entries(metrics).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        percentile: value.percentile,
        category: value.category,
        distributions: value.distributions,
      };
      return acc;
    },
    {} as Record<string, CoreWebVitalMetric>,
  );
}

// Calculate Lighthouse score for a metric using log-normal distribution approach
function calculateLighthouseScore(
  value: number,
  thresholds: { good: number; needsImprovement: number },
  isRatio = false,
): number {
  if (isRatio) {
    // For CLS (ratio metric)
    if (value <= thresholds.good) return 100;
    if (value <= thresholds.needsImprovement) {
      const range = thresholds.needsImprovement - thresholds.good;
      const position = value - thresholds.good;
      return Math.round(100 - (position / range) * 50);
    }
    const poorThreshold = thresholds.needsImprovement * 2.5;
    if (value >= poorThreshold) return 0;
    const poorRange = poorThreshold - thresholds.needsImprovement;
    const poorPosition = value - thresholds.needsImprovement;
    return Math.round(50 - (poorPosition / poorRange) * 50);
  } else {
    // For time-based metrics (FCP, SI, LCP, TBT)
    if (value <= thresholds.good) return 100;
    if (value <= thresholds.needsImprovement) {
      const range = thresholds.needsImprovement - thresholds.good;
      const position = value - thresholds.good;
      return Math.round(100 - (position / range) * 50);
    }
    const poorThreshold = thresholds.needsImprovement * 2;
    if (value >= poorThreshold) return 0;
    const poorRange = poorThreshold - thresholds.needsImprovement;
    const poorPosition = value - thresholds.needsImprovement;
    return Math.round(50 - (poorPosition / poorRange) * 50);
  }
}

// Transform lab data for Lighthouse Performance Score Ring visualization
function transformLabDataForLighthouse(labMetrics: Record<string, number>) {
  const metricConfigs = [
    { key: "first-contentful-paint", label: "FCP", isRatio: false },
    { key: "speed-index", label: "SI", isRatio: false },
    { key: "largest-contentful-paint", label: "LCP", isRatio: false },
    { key: "total-blocking-time", label: "TBT", isRatio: false },
    { key: "cumulative-layout-shift", label: "CLS", isRatio: true },
  ] as const;

  const metrics = metricConfigs.map(({ key, label, isRatio }) => {
    const value = labMetrics[key] || 0;
    const weight = LIGHTHOUSE_WEIGHTS[key];
    const thresholds = LIGHTHOUSE_THRESHOLDS[key];
    const score = calculateLighthouseScore(value, thresholds, isRatio);

    return { key, label, value, weight, score };
  });

  const overallScore = Math.round(
    metrics.reduce((sum, metric) => sum + metric.score * metric.weight, 0),
  );

  return { overallScore, metrics };
}

function transformRealUserMetrics(metrics: Record<string, CoreWebVitalMetric>) {
  const metricLabels = {
    first_contentful_paint: "First Contentful Paint",
    largest_contentful_paint: "Largest Contentful Paint",
    cumulative_layout_shift: "Cumulative Layout Shift",
    interaction_to_next_paint: "Interaction to Next Paint",
    experimental_time_to_first_byte: "Time to First Byte",
  } as const;

  return Object.entries(metrics).map(([key, data]) => ({
    key,
    label: metricLabels[key as keyof typeof metricLabels] || key,
    value: data.percentile,
    percentile: data.percentile,
    category: data.category,
  }));
}

async function runPageSpeedAnalysis(
  url: string,
  strategy: "mobile" | "desktop" = "desktop",
  categories: string[] = DEFAULT_CATEGORIES,
) {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
  const validCategories = categories.filter((cat) =>
    VALID_CATEGORIES.includes(cat as PageSpeedCategory),
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

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("Google API key is required for PageSpeed Insights API");
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      normalizedUrl,
    )}&strategy=${strategy}&${categoryParams}&key=${apiKey}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `PageSpeed Insights API failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    const fieldData = data.loadingExperience as RawFieldData | undefined;
    const originData = data.originLoadingExperience as RawFieldData | undefined;
    const labData = data.lighthouseResult as
      | {
          categories?: Record<string, { score?: number }>;
          audits?: Record<string, LighthouseAudit>;
        }
      | undefined;

    const realUserExperience = fieldData
      ? {
          overallCategory: fieldData.overall_category,
          metrics: fieldData.metrics ? transformMetrics(fieldData.metrics) : {},
          id: fieldData.id,
        }
      : null;

    const originExperience = originData
      ? {
          overallCategory: originData.overall_category,
          metrics: originData.metrics
            ? transformMetrics(originData.metrics)
            : {},
          id: originData.id,
        }
      : null;

    const labResults = labData
      ? {
          scores: {
            performance: Math.round(
              (labData.categories?.performance?.score ?? 0) * 100,
            ),
            accessibility: Math.round(
              (labData.categories?.accessibility?.score ?? 0) * 100,
            ),
            "best-practices": Math.round(
              (labData.categories?.["best-practices"]?.score ?? 0) * 100,
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
            "time-to-first-byte":
              labData.audits?.["server-response-time"]?.numericValue ?? 0,
            interactive: labData.audits?.interactive?.numericValue ?? 0,
          },
          opportunities: labData.audits
            ? Object.values(labData.audits)
                .filter(
                  (audit): audit is LighthouseAudit =>
                    audit &&
                    typeof audit === "object" &&
                    audit.scoreDisplayMode === "numeric" &&
                    typeof audit.score === "number" &&
                    audit.score < 0.9,
                )
                .map((audit) => ({
                  title: audit.title,
                  description: audit.description,
                  score: audit.score,
                  displayValue: audit.displayValue,
                }))
                .slice(0, 10)
            : [],
        }
      : null;

    const lighthouseVisualization = labResults
      ? transformLabDataForLighthouse(labResults.metrics)
      : null;

    const fieldMetricsForDisplay = realUserExperience?.metrics
      ? transformRealUserMetrics(realUserExperience.metrics)
      : null;

    const originMetricsForDisplay = originExperience?.metrics
      ? transformRealUserMetrics(originExperience.metrics)
      : null;

    // Use the existing opportunities from labResults
    const opportunities = labResults?.opportunities || [];
    const diagnostics: any[] = [];

    const result = {
      url: normalizedUrl,
      strategy,
      timestamp: data.analysisUTCTimestamp || new Date().toISOString(),
      captchaResult: data.captchaResult,
      version: data.version?.major
        ? `${data.version.major}.${data.version.minor}`
        : "unknown",
      // Performance insights
      insights: {
        performanceScore: labResults?.scores.performance || 0,
        opportunities,
        diagnostics,
        coreWebVitals: {
          fieldData: realUserExperience
            ? {
                overallCategory: realUserExperience.overallCategory,
                metrics: Object.keys(realUserExperience.metrics).length,
              }
            : null,
          originData: originExperience
            ? {
                overallCategory: originExperience.overallCategory,
                metrics: Object.keys(originExperience.metrics).length,
              }
            : null,
        },
      },
      visualizations: {
        lighthouseScoreRing: lighthouseVisualization,
        realUserMetrics: {
          fieldData: fieldMetricsForDisplay,
          originData: originMetricsForDisplay,
        },
      },
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
      }`,
    );
  }
}

export const pageSpeedTool = tool({
  description:
    "Analyze website performance using Google PageSpeed Insights API. Provides comprehensive data including real user experience (field data), origin-wide performance metrics, and lab testing results. Much more valuable than basic Lighthouse analysis as it includes actual user experience data from Chrome UX Report.",
  inputSchema: pageSpeedInputSchema,
  execute: async ({ url, strategy, categories }) => {
    return runPageSpeedAnalysis(url, strategy, categories);
  },
});

import type {
  FieldMetrics,
  LighthouseScoreMetric,
} from "@/types/real-world-performance";
import type {
  MetricBadgeConfig,
  MetricThresholds,
  WebVitalsThresholds,
} from "@/types/web-vitals";

// Lighthouse 10 weights (Nov 2023)
export const LIGHTHOUSE_WEIGHTS = {
  largest_contentful_paint: 0.25,
  interaction_to_next_paint: 0.25,
  cumulative_layout_shift: 0.25,
  first_contentful_paint: 0.1,
  experimental_time_to_first_byte: 0.15,
} as const;

// Lighthouse 10 scoring thresholds
export const LIGHTHOUSE_THRESHOLDS: Record<string, WebVitalsThresholds> = {
  largest_contentful_paint: { good: 2500, poor: 4000 },
  interaction_to_next_paint: { good: 200, poor: 500 },
  cumulative_layout_shift: { good: 0.1, poor: 0.25 },
  first_contentful_paint: { good: 1800, poor: 3000 },
  experimental_time_to_first_byte: { good: 800, poor: 1800 },
};

// Metric thresholds for distribution bars
export const METRIC_THRESHOLDS: Record<string, MetricThresholds> = {
  cumulative_layout_shift: { good: 0.1, needsImprovement: 0.25 },
  largest_contentful_paint: { good: 2500, needsImprovement: 4000 },
  first_contentful_paint: { good: 1800, needsImprovement: 3000 },
  interaction_to_next_paint: { good: 200, needsImprovement: 500 },
  experimental_time_to_first_byte: { good: 800, needsImprovement: 1800 },
};

export const METRIC_LABELS: Record<string, string> = {
  largest_contentful_paint: "LCP",
  interaction_to_next_paint: "INP",
  cumulative_layout_shift: "CLS",
  first_contentful_paint: "FCP",
  experimental_time_to_first_byte: "TTFB",
};

export const METRIC_NAMES: Record<string, string> = {
  largest_contentful_paint: "Largest Contentful Paint (LCP)",
  interaction_to_next_paint: "Interaction to Next Paint (INP)",
  cumulative_layout_shift: "Cumulative Layout Shift (CLS)",
  first_contentful_paint: "First Contentful Paint (FCP)",
  experimental_time_to_first_byte: "Time to First Byte (TTFB)",
};

export const METRIC_ABBREVIATIONS: Record<string, string> = {
  largest_contentful_paint: "LCP",
  interaction_to_next_paint: "INP",
  cumulative_layout_shift: "CLS",
  first_contentful_paint: "FCP",
  experimental_time_to_first_byte: "TTFB",
};

export const METRIC_FULL_NAMES: Record<string, string> = {
  first_contentful_paint: "First Contentful Paint",
  largest_contentful_paint: "Largest Contentful Paint",
  cumulative_layout_shift: "Cumulative Layout Shift",
  interaction_to_next_paint: "Interaction to Next Paint",
  experimental_time_to_first_byte: "Time to First Byte",
};

export const BADGE_CONFIGS: Record<string, MetricBadgeConfig> = {
  FAST: {
    variant: "default",
    label: "FAST",
    className: "text-white font-medium",
  },
  AVERAGE: {
    variant: "secondary",
    label: "MEH",
    className: "text-white font-medium",
  },
  SLOW: {
    variant: "destructive",
    label: "SLOW",
    className: "text-white font-medium",
  },
};

// CLS-specific badge configurations (stability metric, not speed)
export const CLS_BADGE_CONFIGS: Record<string, MetricBadgeConfig> = {
  FAST: {
    variant: "default",
    label: "GOOD",
    className: "text-white font-medium",
  },
  AVERAGE: {
    variant: "secondary",
    label: "MEH",
    className: "text-white font-medium",
  },
  SLOW: {
    variant: "destructive",
    label: "BAD",
    className: "text-white font-medium",
  },
};

export const COLOR_VARS = [
  "var(--score-good)",
  "var(--score-needs-improvement)",
  "var(--score-poor)",
];

export function calculateMetricScore(metricKey: string, value: number): number {
  const threshold = LIGHTHOUSE_THRESHOLDS[metricKey];
  if (!threshold) return 50; // fallback

  if (value <= threshold.good) return 100;
  if (value >= threshold.poor) return 0;

  // Linear interpolation between good and poor
  return Math.round(
    100 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 100
  );
}

export function calculateLighthouseScore(metrics: FieldMetrics): {
  overallScore: number;
  metrics: LighthouseScoreMetric[];
} {
  let totalScore = 0;
  let totalWeight = 0;
  const lighthouseMetrics: LighthouseScoreMetric[] = [];

  for (const [key, weight] of Object.entries(LIGHTHOUSE_WEIGHTS)) {
    const metric = metrics[key as keyof FieldMetrics];
    if (metric) {
      const value = metric.percentile;
      const score = calculateMetricScore(key, value);

      totalScore += score * weight;
      totalWeight += weight;

      lighthouseMetrics.push({
        key: key.replace(/_/g, "-"),
        label: METRIC_LABELS[key] || key,
        value,
        weight,
        score,
      });
    }
  }

  const overallScore =
    totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  return { overallScore, metrics: lighthouseMetrics };
}

export function formatMetricValue(key: string, value: number): number {
  if (key === "cumulative_layout_shift") {
    return Number((value / 100).toFixed(2));
  }
  return Number((value / 1000).toFixed(2));
}

export function formatThresholdValue(key: string, value: number): string {
  if (key === "cumulative_layout_shift") {
    return value.toString();
  }
  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`;
}

export function getMetricValueColor(category: string): string {
  return category === "FAST"
    ? "var(--score-good)"
    : category === "AVERAGE"
    ? "var(--score-needs-improvement)"
    : "var(--score-poor)";
}

export function getMetricBackgroundColor(category: string): string {
  return category === "FAST"
    ? "var(--score-good)"
    : category === "AVERAGE"
    ? "var(--score-needs-improvement)"
    : "var(--score-poor)";
}

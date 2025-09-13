// Types for real-world performance data
export type PerformanceCategory = "GOOD" | "NEEDS_IMPROVEMENT" | "POOR";

export interface MetricDistribution {
  min: number;
  max?: number;
  proportion: number;
}

export interface CoreWebVitalMetric {
  percentile: number;
  category: PerformanceCategory;
  distributions: MetricDistribution[];
}

export interface FieldMetrics {
  first_contentful_paint?: CoreWebVitalMetric;
  largest_contentful_paint?: CoreWebVitalMetric;
  cumulative_layout_shift?: CoreWebVitalMetric;
  interaction_to_next_paint?: CoreWebVitalMetric;
  experimental_time_to_first_byte?: CoreWebVitalMetric;
  first_input_delay?: CoreWebVitalMetric;
}

export interface PerformanceData {
  overallCategory: string;
  metrics: FieldMetrics;
}

export interface SentryScoreMetric {
  key: string;
  label: string;
  value: number;
  weight: number;
  score: number;
}

export interface SentryScoreData {
  overallScore: number;
  metrics: SentryScoreMetric[];
}

export interface RealWorldPerformanceOutput {
  url: string;
  hasData: boolean;
  mobile?: {
    fieldData?: PerformanceData;
    originData?: PerformanceData;
    sentryScore?: SentryScoreData;
  };
  desktop?: {
    fieldData?: PerformanceData;
    originData?: PerformanceData;
    sentryScore?: SentryScoreData;
  };
}

// Sentry Performance Score thresholds and weights
export const SENTRY_THRESHOLDS = {
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
} as const;

export const SENTRY_WEIGHTS = {
  "largest-contentful-paint": 0.3,
  "cumulative-layout-shift": 0.15,
  "first-contentful-paint": 0.15,
  "time-to-first-byte": 0.1,
  "interaction-to-next-paint": 0.3,
} as const;
/**
 * PageSpeed Insights configuration types for WebVitals analysis
 */

export type PageSpeedStrategy = "mobile" | "desktop";

export type PageSpeedCategory =
  | "performance"
  | "accessibility"
  | "best-practices"
  | "seo"
  | "pwa";

export interface PageSpeedConfig {
  strategy: PageSpeedStrategy;
  categories: PageSpeedCategory[];
  locale?: string;
}

export const CATEGORY_LABELS: Record<PageSpeedCategory, string> = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
  pwa: "PWA",
};

export const STRATEGY_LABELS: Record<PageSpeedStrategy, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
};

export const DEFAULT_PAGESPEED_CONFIG: PageSpeedConfig = {
  strategy: "desktop",
  categories: ["performance", "accessibility", "best-practices", "seo"],
  locale: "en-US",
};

/**
 * PageSpeed Insights API response types
 */

export type PerformanceCategory = "FAST" | "AVERAGE" | "SLOW";

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
  CUMULATIVE_LAYOUT_SHIFT_SCORE: CoreWebVitalMetric;
  EXPERIMENTAL_TIME_TO_FIRST_BYTE: CoreWebVitalMetric;
  FIRST_CONTENTFUL_PAINT_MS: CoreWebVitalMetric;
  INTERACTION_TO_NEXT_PAINT: CoreWebVitalMetric;
  LARGEST_CONTENTFUL_PAINT_MS: CoreWebVitalMetric;
}

export interface FieldData {
  overallCategory: PerformanceCategory;
  metrics: FieldMetrics;
  id: string;
}

export interface OriginData {
  overallCategory: PerformanceCategory;
  metrics: FieldMetrics;
  id: string;
}

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  "best-practices": number;
  seo: number;
  pwa: number;
}

export interface LighthouseMetrics {
  "first-contentful-paint": number;
  "largest-contentful-paint": number;
  "cumulative-layout-shift": number;
  "total-blocking-time": number;
  "speed-index": number;
  interactive: number;
}

export interface LighthouseOpportunity {
  title: string;
  description: string;
  score: number;
  displayValue?: string;
}

export interface LabData {
  scores: LighthouseScores;
  metrics: LighthouseMetrics;
  opportunities: LighthouseOpportunity[];
}

export interface PageSpeedToolInput {
  url: string;
  strategy: PageSpeedStrategy;
  categories: PageSpeedCategory[];
}

export interface PageSpeedToolOutput {
  url: string;
  strategy: PageSpeedStrategy;
  timestamp: string;
  fieldData: FieldData;
  originData: OriginData;
  labData: LabData;
  captchaResult: string;
  version: string;
}

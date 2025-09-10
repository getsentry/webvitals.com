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

export interface FieldData {
  overallCategory: PerformanceCategory;
  metrics: Record<string, CoreWebVitalMetric>;
  id: string;
}

export interface OriginData {
  overallCategory: PerformanceCategory;
  metrics: Record<string, CoreWebVitalMetric>;
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

// Visualization interfaces for UI components
export interface LighthouseVisualizationMetric {
  key: string;
  label: string;
  value: number;
  weight: number;
  score: number;
}

export interface LighthouseScoreVisualization {
  overallScore: number;
  metrics: LighthouseVisualizationMetric[];
}

export interface RealUserMetricVisualization {
  key: string;
  label: string;
  value: number | string;
  percentile?: number;
  category: PerformanceCategory;
}

export interface RealUserMetricsVisualization {
  fieldData: RealUserMetricVisualization[] | null;
  originData: RealUserMetricVisualization[] | null;
}

export interface PageSpeedVisualizationData {
  lighthouseScoreRing: LighthouseScoreVisualization | null;
  realUserMetrics: RealUserMetricsVisualization;
}

export interface PageSpeedOpportunity {
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  id: string;
}

export interface PageSpeedDiagnostic {
  title: string;
  description: string;
  displayValue?: string;
  id: string;
}

export interface PageSpeedInsights {
  performanceScore: number;
  opportunities: PageSpeedOpportunity[];
  diagnostics: PageSpeedDiagnostic[];
  coreWebVitals: {
    fieldData: {
      overallCategory: PerformanceCategory;
      metrics: number;
    } | null;
    originData: {
      overallCategory: PerformanceCategory;
      metrics: number;
    } | null;
  };
}

export interface PageSpeedToolOutput {
  url: string;
  strategy: PageSpeedStrategy;
  timestamp: string;
  captchaResult: string;
  version: string;
  insights: PageSpeedInsights;
  visualizations: PageSpeedVisualizationData;
}

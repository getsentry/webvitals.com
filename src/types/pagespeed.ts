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

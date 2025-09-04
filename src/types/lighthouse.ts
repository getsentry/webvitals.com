/**
 * Lighthouse configuration types for WebVitals analysis
 */

export type LighthouseFormFactor = "mobile" | "desktop";

export type LighthouseCategory =
  | "performance"
  | "accessibility"
  | "best-practices"
  | "seo"
  | "pwa";

export type ThrottlingPreset = "none" | "slow-3g" | "fast-3g";

export type LighthouseOutput = "json" | "html" | "csv";

export type LogLevel = "silent" | "error" | "warn" | "info" | "verbose";

export interface LighthouseThrottling {
  preset: ThrottlingPreset;
  rttMs?: number;
  throughputKbps?: number;
  requestLatencyMs?: number;
  downloadThroughputKbps?: number;
  uploadThroughputKbps?: number;
  cpuSlowdownMultiplier?: number;
}

export interface LighthouseScreenEmulation {
  mobile: boolean;
  width: number;
  height: number;
  deviceScaleFactor: number;
  disabled: boolean;
}

export interface LighthouseConfig {
  formFactor: LighthouseFormFactor;
  categories: LighthouseCategory[];
  throttling: LighthouseThrottling;
  screenEmulation: LighthouseScreenEmulation;
  locale?: string;
  onlyCategories?: LighthouseCategory[];
  onlyAudits?: string[];
  skipAudits?: string[];
  logLevel?: LogLevel;
  output?: LighthouseOutput[];
  chromeFlags?: string[];
  budgets?: Array<{
    resourceSizes: Array<{
      resourceType: string;
      budget: number;
    }>;
  }>;
}

export const THROTTLING_PRESETS: Record<
  ThrottlingPreset,
  LighthouseThrottling
> = {
  none: {
    preset: "none",
    rttMs: 0,
    throughputKbps: 0,
    cpuSlowdownMultiplier: 1,
  },
  "fast-3g": {
    preset: "fast-3g",
    rttMs: 40,
    throughputKbps: 10 * 1024,
    requestLatencyMs: 40,
    downloadThroughputKbps: 10 * 1024,
    uploadThroughputKbps: 768,
    cpuSlowdownMultiplier: 1,
  },
  "slow-3g": {
    preset: "slow-3g",
    rttMs: 150,
    throughputKbps: 1.6 * 1024,
    requestLatencyMs: 150 * 3.75,
    downloadThroughputKbps: 1.6 * 1024,
    uploadThroughputKbps: 750,
    cpuSlowdownMultiplier: 4,
  },
};

export const CATEGORY_LABELS: Record<LighthouseCategory, string> = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
  pwa: "PWA",
};

export const FORM_FACTOR_LABELS: Record<LighthouseFormFactor, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
};

export const THROTTLING_LABELS: Record<ThrottlingPreset, string> = {
  none: "No Throttling",
  "fast-3g": "Fast 3G",
  "slow-3g": "Slow 3G",
};

export const DEFAULT_LIGHTHOUSE_CONFIG: LighthouseConfig = {
  formFactor: "desktop",
  categories: ["performance", "accessibility", "best-practices", "seo"],
  throttling: {
    ...THROTTLING_PRESETS.none,
  },
  screenEmulation: {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false,
  },
  locale: "en-US",
  logLevel: "info",
  output: ["json"],
};

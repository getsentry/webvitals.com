export interface WebVitalsThresholds {
  good: number;
  poor: number;
}

export interface MetricThresholds {
  good: number;
  needsImprovement: number;
}

export interface TechnologyDetectionOutput {
  url: string;
  technologies: Array<{
    name: string;
    confidence: number;
    categories: string[];
  }>;
  summary: {
    totalDetected: number;
    byCategory: Record<string, string[]>;
  };
}

export type BadgeVariant = "default" | "secondary" | "destructive";

export interface MetricBadgeConfig {
  variant: BadgeVariant;
  label: string;
  className: string;
}

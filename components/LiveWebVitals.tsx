"use client";

import NumberFlow from "@number-flow/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useVitalsStore } from "@/hooks/useVitalsStore";
import { SENTRY_THRESHOLDS } from "@/types/real-world-performance";

export default function LiveWebVitals() {
  const vitals = useVitalsStore();

  const scrollToMetric = (metricName: string) => {
    const element = document.getElementById(
      `metric-${metricName.toLowerCase()}`,
    );
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const getScoreColor = (name: string, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return "text-muted-foreground";

    let thresholds: { good: number; needsImprovement: number };
    switch (name) {
      case "LCP":
        thresholds = SENTRY_THRESHOLDS.mobile["largest-contentful-paint"];
        break;
      case "INP":
        thresholds = SENTRY_THRESHOLDS.mobile["interaction-to-next-paint"];
        break;
      case "CLS":
        thresholds = SENTRY_THRESHOLDS.mobile["cumulative-layout-shift"];
        break;
      case "FCP":
        thresholds = SENTRY_THRESHOLDS.mobile["first-contentful-paint"];
        break;
      case "TTFB":
        thresholds = SENTRY_THRESHOLDS.mobile["time-to-first-byte"];
        break;
      default:
        return "text-muted-foreground";
    }

    if (numValue <= thresholds.good) return "text-score-good";
    if (numValue <= thresholds.needsImprovement)
      return "text-score-needs-improvement";
    return "text-score-poor";
  };

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Live Web Vitals
            </h3>
            <p className="text-sm text-muted-foreground">
              Real-time metrics from your current page visit
            </p>
          </div>
          <Link
            href="https://docs.sentry.io/product/insights/frontend/web-vitals/?ref=webvitals.com"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Monitor in production <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Mobile: 2-row layout, Desktop: single 5-column row */}
        <div className="space-y-3 md:space-y-0">
          {/* Mobile: Core Web Vitals first row */}
          <div className="grid grid-cols-3 gap-3 md:hidden">
            {["LCP", "INP", "CLS"].map((name) => (
              <div
                key={name}
                onClick={() => scrollToMetric(name)}
                className="bg-card border border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {name}
                </div>
                <NumberFlow
                  value={Number(vitals[name as keyof typeof vitals]) || 0}
                  suffix={name === "CLS" ? "" : "ms"}
                  format={{
                    minimumFractionDigits: name === "CLS" ? 3 : 0,
                    maximumFractionDigits: name === "CLS" ? 3 : 0,
                  }}
                  className={`text-lg font-semibold ${getScoreColor(name, vitals[name as keyof typeof vitals])}`}
                />
              </div>
            ))}
          </div>

          {/* Mobile: Other Vitals second row */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {["FCP", "TTFB"].map((name) => (
              <div
                key={name}
                onClick={() => scrollToMetric(name)}
                className="bg-card border border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {name}
                </div>
                <NumberFlow
                  value={Number(vitals[name as keyof typeof vitals]) || 0}
                  suffix="ms"
                  format={{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }}
                  className={`text-lg font-semibold ${getScoreColor(name, vitals[name as keyof typeof vitals])}`}
                />
              </div>
            ))}
          </div>

          {/* Desktop: Single 5-column row */}
          <div className="hidden md:grid md:grid-cols-5 gap-3">
            {Object.entries(vitals).map(([name, value]) => (
              <div
                key={name}
                onClick={() => scrollToMetric(name)}
                className="bg-card border border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {name}
                </div>
                <NumberFlow
                  value={Number(value) || 0}
                  suffix={name === "CLS" ? "" : "ms"}
                  format={{
                    minimumFractionDigits: name === "CLS" ? 3 : 0,
                    maximumFractionDigits: name === "CLS" ? 3 : 0,
                  }}
                  className={`text-lg font-semibold ${getScoreColor(name, value)}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

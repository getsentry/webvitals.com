"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLoadState } from "@/hooks/useLoadState";
import { SENTRY_THRESHOLDS } from "@/types/real-world-performance";

interface VitalData {
  name: string;
  href: string;
  score: string;
  thresholds: {
    good: number;
    needsImprovement: number;
  };
  tooltip: string;
  formatter?: (score: string) => string;
}

function formatScore(
  score: string,
  formatter?: (score: string) => string,
): string {
  if (formatter) return formatter(score);
  if (score === "n/a") return score;
  const numScore = Number(score);
  return !isNaN(numScore) ? `${Math.round(numScore)}ms` : score;
}

function getScoreColor(
  score: string,
  thresholds: { good: number; needsImprovement: number },
): string {
  if (score === "n/a") return "text-muted-foreground";
  const numScore = Number(score);
  if (isNaN(numScore)) return "text-muted-foreground";

  if (numScore <= thresholds.good) return "text-score-good";
  if (numScore <= thresholds.needsImprovement)
    return "text-score-needs-improvement";
  return "text-score-poor";
}

function VitalItem({
  vital,
  isHighlighted,
}: {
  vital: VitalData;
  isHighlighted?: boolean;
}) {
  const scoreColor = getScoreColor(vital.score, vital.thresholds);
  const formattedScore = formatScore(vital.score, vital.formatter);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={vital.href}
            className={`block p-3 rounded-lg border transition-colors ${
              isHighlighted
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:bg-accent"
            }`}
          >
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium ${isHighlighted ? "text-primary" : "text-foreground"}`}
              >
                {vital.name}
              </span>
              <Badge variant="outline" className={scoreColor}>
                {formattedScore}
              </Badge>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm text-pretty">
          {vital.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function VitalsReport({
  currentMetric,
}: {
  currentMetric?: string;
} = {}) {
  const { loading } = useLoadState();

  const [vitals, setVitals] = useState({
    FCP: "n/a",
    TTFB: "n/a",
    LCP: "n/a",
    INP: "n/a",
    CLS: "n/a",
  });

  useEffect(() => {
    const onMetric = (metric: Metric) => {
      setVitals((vitals) => ({
        ...vitals,
        [metric.name]: String(metric.value),
      }));
    };

    onFCP(onMetric, { reportAllChanges: true });
    onLCP(onMetric, { reportAllChanges: true });
    onTTFB(onMetric, { reportAllChanges: true });
    onCLS(onMetric, { reportAllChanges: true });
    onINP(onMetric, { reportAllChanges: true });
  }, []);

  const coreVitals: VitalData[] = [
    {
      name: "Largest Contentful Paint",
      href: "/lcp",
      score: vitals.LCP,
      thresholds: SENTRY_THRESHOLDS.mobile["largest-contentful-paint"],
      tooltip:
        "Measures the time it takes for the largest text or image element to render on a webpage.",
    },
    {
      name: "Cumulative Layout Shift",
      href: "/cls",
      score: vitals.CLS,
      thresholds: SENTRY_THRESHOLDS.mobile["cumulative-layout-shift"],
      formatter: (score: string) =>
        !isNaN(Number(score)) ? Number(score).toFixed(3) : score,
      tooltip:
        "Measures the total amount of unexpected layout shifts that occur during the entire lifespan of a webpage.",
    },
    {
      name: "Interaction to Next Paint",
      href: "/inp",
      score: vitals.INP,
      thresholds: SENTRY_THRESHOLDS.mobile["interaction-to-next-paint"],
      tooltip:
        "Measures the time from when a user interacts with a page to when the browser renders the visual response to that interaction.",
    },
  ];

  const otherVitals: VitalData[] = [
    {
      name: "First Contentful Paint",
      href: "/fcp",
      score: vitals.FCP,
      thresholds: SENTRY_THRESHOLDS.mobile["first-contentful-paint"],
      tooltip:
        "Measures the time from when a page starts loading to when any part of the page's content is first displayed.",
    },
    {
      name: "Time to First Byte",
      href: "/ttfb",
      score: vitals.TTFB,
      thresholds: SENTRY_THRESHOLDS.mobile["time-to-first-byte"],
      tooltip:
        "Measures the duration from when a page starts loading to when the first byte of content is received from the server.",
    },
  ];

  return loading ? null : (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Web Vitals Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Core Web Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {coreVitals.map((vital) => (
                <VitalItem
                  key={vital.name}
                  vital={vital}
                  isHighlighted={Boolean(
                    currentMetric &&
                      vital.href === `/${currentMetric.toLowerCase()}`,
                  )}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Other Vitals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherVitals.map((vital) => (
                <VitalItem
                  key={vital.name}
                  vital={vital}
                  isHighlighted={Boolean(
                    currentMetric &&
                      vital.href === `/${currentMetric.toLowerCase()}`,
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
          NOTE: Interaction web vitals (INP) won't show until you interact with
          the page or change tabs.
        </p>
      </CardContent>
    </Card>
  );
}

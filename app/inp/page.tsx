"use client";

import { useEffect, useState } from "react";
import { onINP } from "web-vitals";
import DemoHeader from "@/components/demo/DemoHeader";
import DemoLayout from "@/components/demo/DemoLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { triggerVisibilityChange } from "@/lib/triggerVisibilityChange";
import { SENTRY_THRESHOLDS } from "@/types/real-world-performance";

export const dynamic = "force-dynamic";

export default function INPPage() {
  const [clickCount, setClickCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState<number | null>(
    null,
  );
  const [currentINP, setCurrentINP] = useState<number | null>(null);

  // Listen for INP values from web-vitals
  useEffect(() => {
    onINP((metric) => {
      setCurrentINP(metric.value);
    });
  }, []);

  const handleSlowButton = () => {
    setIsProcessing(true);

    // Random delay between 200-700ms
    const delay = Math.floor(Math.random() * (700 - 200 + 1)) + 200;
    const start = performance.now();
    do {
      // Intentionally block the main thread - this is what INP measures
    } while (performance.now() - start < delay);

    setClickCount((prev) => prev + 1);
    setLastInteractionTime(delay);
    setIsProcessing(false);

    // Trigger visibility change to force INP reporting
    setTimeout(() => {
      triggerVisibilityChange(document, true);
    }, 100);
  };

  const handleFastButton = () => {
    const start = performance.now();
    setClickCount((prev) => prev + 1);
    setLastInteractionTime(performance.now() - start);

    // Trigger visibility change to force INP reporting
    setTimeout(() => {
      triggerVisibilityChange(document, true);
    }, 100);
  };

  const handleResetButton = () => {
    setClickCount(0);
    setLastInteractionTime(null);
  };

  return (
    <DemoLayout currentMetric="INP">
      <DemoHeader
        vitalName="INP"
        vitalDesc="Interaction to Next Paint"
        vitalColor="oklch(0.68 0.18 300)"
        isCore={true}
      >
        Measures the time from when a user interacts with a page to when the
        browser renders the visual response to that interaction.
      </DemoHeader>

      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>How INP is Calculated</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.68 0.18 300)" }}
                >
                  1
                </span>
                <div>
                  <strong className="text-foreground">Interaction Start</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Measurement begins when user initiates interaction (click,
                    tap, key press)
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.68 0.18 300)" }}
                >
                  2
                </span>
                <div>
                  <strong className="text-foreground">Event Processing</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Browser processes event handlers, JavaScript execution, DOM
                    updates
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.68 0.18 300)" }}
                >
                  3
                </span>
                <div>
                  <strong className="text-foreground">Next Paint</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Browser renders visual response, updating display with new
                    content
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.68 0.18 300)" }}
                >
                  4
                </span>
                <div>
                  <strong className="text-foreground">INP Calculation</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Reports longest interaction latency (or 98th percentile for
                    many interactions)
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>INP measures responsiveness:</strong> Click, tap, and
                keyboard interactions are monitored throughout the page visit.
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-good" />
                <div>
                  <span className="font-semibold">Good</span>
                  <span className="text-muted-foreground ml-2">
                    ≤{" "}
                    {SENTRY_THRESHOLDS.mobile["interaction-to-next-paint"].good}
                    ms
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-needs-improvement" />
                <div>
                  <span className="font-semibold">Needs Improvement</span>
                  <span className="text-muted-foreground ml-2">
                    {SENTRY_THRESHOLDS.mobile["interaction-to-next-paint"].good}
                    ms -{" "}
                    {
                      SENTRY_THRESHOLDS.mobile["interaction-to-next-paint"]
                        .needsImprovement
                    }
                    ms
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-poor" />
                <div>
                  <span className="font-semibold">Poor</span>
                  <span className="text-muted-foreground ml-2">
                    &gt;{" "}
                    {
                      SENTRY_THRESHOLDS.mobile["interaction-to-next-paint"]
                        .needsImprovement
                    }
                    ms
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 lg:order-2">
          <CardHeader>
            <CardTitle>INP Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Try these buttons to see how different types of interactions
              affect INP. The slow button simulates heavy JavaScript
              computation.
            </p>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleFastButton}
                  variant="default"
                  disabled={isProcessing}
                >
                  Fast Response
                </Button>

                <Button
                  onClick={handleSlowButton}
                  variant="destructive"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Slow Response"}
                </Button>

                <Button
                  onClick={handleResetButton}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Reset Counter
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  Clicks: {clickCount}
                </Badge>

                {currentINP !== null && (
                  <Badge
                    variant="outline"
                    className={`text-sm ${
                      currentINP > 500
                        ? "text-score-poor"
                        : currentINP > 200
                          ? "text-score-needs-improvement"
                          : "text-score-good"
                    }`}
                  >
                    Current INP: {Math.round(currentINP)}ms
                  </Badge>
                )}
              </div>
            </div>

            <div
              className="p-4 rounded-lg mt-4"
              style={{
                backgroundColor:
                  "color-mix(in srgb, oklch(0.68 0.18 300) 10%, transparent)",
                borderLeft: "4px solid oklch(0.68 0.18 300)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "oklch(0.68 0.18 300)" }}
                />
                <strong className="text-foreground">Real-world impact</strong>
              </div>
              <p className="text-sm text-muted-foreground">
                Poor INP makes interfaces feel sluggish and unresponsive. Users
                expect interactions to respond within 100ms for optimal
                experience.
              </p>
            </div>

            <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
              <strong>Note:</strong> Your browser may freeze temporarily when
              clicking the slow button. This demonstrates how blocking
              JavaScript affects user experience and INP scores.
            </p>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLS Demo - Cumulative Layout Shift",
  description:
    "Experience Cumulative Layout Shift (CLS) with an interactive demo. Learn how unexpected layout shifts affect user experience and Core Web Vitals scores.",
  keywords: [
    "CLS",
    "Cumulative Layout Shift",
    "Core Web Vitals",
    "layout stability",
    "visual stability",
  ],
  openGraph: {
    title: "CLS Demo - Cumulative Layout Shift | WebVitals",
    description:
      "Experience Cumulative Layout Shift (CLS) with an interactive demo. Learn how layout shifts affect user experience and performance.",
    images: ["/cls/opengraph-image"],
  },
  twitter: {
    title: "CLS Demo - Cumulative Layout Shift | WebVitals",
    description:
      "Experience Cumulative Layout Shift (CLS) with an interactive demo. Learn how layout shifts affect user experience and performance.",
    images: ["/cls/opengraph-image"],
  },
};

("use client");

import { useEffect, useState } from "react";

import DemoHeader from "@/components/demo/DemoHeader";
import DemoLayout from "@/components/demo/DemoLayout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoadState } from "@/hooks/useLoadState";
import { triggerVisibilityChange } from "@/lib/triggerVisibilityChange";
import { SENTRY_THRESHOLDS } from "@/types/real-world-performance";

export const dynamic = "force-dynamic";

export default function CLSPage() {
  const [blockCount, setBlockCount] = useState(0);

  const { setLoading } = useLoadState();
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  useEffect(() => {
    const addBlocks = () => {
      if (blockCount < 5) {
        setTimeout(() => {
          setBlockCount(blockCount + 1);
        }, 500);
      } else {
        // Trigger visibility change to force CLS reporting
        setTimeout(() => {
          triggerVisibilityChange(document, true);
        }, 100);
      }
    };

    addBlocks();
  }, [blockCount]);

  return (
    <DemoLayout currentMetric="CLS">
      <DemoHeader
        vitalName="CLS"
        vitalDesc="Cumulative Layout Shift"
        vitalColor="oklch(0.7 0.2 340)"
        isCore={true}
        supportedBrowsers={{ safari: false, firefox: false }}
        sentryLink="https://docs.sentry.io/product/insights/frontend/web-vitals/web-vitals-concepts/#cumulative-layout-shift-cls"
      >
        Measures the total amount of unexpected layout shifts that occur during
        the entire lifespan of a webpage.
      </DemoHeader>

      {/* Layout shift blocks that appear and push everything down */}
      {Array.from({ length: blockCount }, (_, i) => (
        <div
          key={i}
          className="p-8 rounded border-4 h-40 flex items-center justify-center text-center mb-6"
          style={{
            backgroundColor:
              "color-mix(in srgb, oklch(0.7 0.2 340) 20%, transparent)",
            borderColor: "oklch(0.7 0.2 340)",
          }}
        >
          <div>
            <p className="font-bold text-foreground text-lg">
              LAYOUT SHIFT BLOCK #{i + 1}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This large block appeared unexpectedly, pushing all content below
              it down!
            </p>
          </div>
        </div>
      ))}

      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>How CLS is Calculated</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.7 0.2 340)" }}
                >
                  1
                </span>
                <div>
                  <strong className="text-foreground">
                    Layout Shift Detection
                  </strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Browser monitors when visible elements change position
                    between frames
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.7 0.2 340)" }}
                >
                  2
                </span>
                <div>
                  <strong className="text-foreground">Impact Fraction</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Measures portion of viewport affected by unstable elements
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.7 0.2 340)" }}
                >
                  3
                </span>
                <div>
                  <strong className="text-foreground">Distance Fraction</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Measures distance elements moved relative to viewport
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.7 0.2 340)" }}
                >
                  4
                </span>
                <div>
                  <strong className="text-foreground">Session Windows</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Groups shifts into sessions, reports maximum window value
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>CLS Formula:</strong> Impact Fraction × Distance
                Fraction
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-good" />
                <div>
                  <span className="font-semibold">Good</span>
                  <span className="text-muted-foreground ml-2">
                    ≤ {SENTRY_THRESHOLDS.mobile["cumulative-layout-shift"].good}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-needs-improvement" />
                <div>
                  <span className="font-semibold">Needs Improvement</span>
                  <span className="text-muted-foreground ml-2">
                    {SENTRY_THRESHOLDS.mobile["cumulative-layout-shift"].good} -{" "}
                    {
                      SENTRY_THRESHOLDS.mobile["cumulative-layout-shift"]
                        .needsImprovement
                    }
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
                      SENTRY_THRESHOLDS.mobile["cumulative-layout-shift"]
                        .needsImprovement
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 lg:order-2">
          <CardHeader>
            <CardTitle>Layout Shift Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Watch content blocks appear and cause major page layout shifts.
              Each block pushes the entire page content down.
            </p>

            <p className="text-sm text-muted-foreground">
              Blocks added: {blockCount}/5
            </p>

            <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
              <strong>Note:</strong> Large content blocks are appearing above
              this section, causing this entire page to shift down
              significantly.
            </p>

            <div
              className="p-4 rounded-lg mt-4"
              style={{
                backgroundColor:
                  "color-mix(in srgb, oklch(0.7 0.2 340) 10%, transparent)",
                borderLeft: "4px solid oklch(0.7 0.2 340)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "oklch(0.7 0.2 340)" }}
                />
                <strong className="text-foreground">Real-world impact</strong>
              </div>
              <p className="text-sm text-muted-foreground">
                Unexpected layout shifts frustrate users and can cause
                accidental clicks. Good visual stability is crucial for user
                experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}

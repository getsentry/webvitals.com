"use client";

import { useEffect } from "react";
import DemoHeader from "@/components/demo/DemoHeader";
import DemoLayout from "@/components/demo/DemoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoadState } from "@/lib/loadState";
import { triggerVisibilityChange } from "@/lib/triggerVisibilityChange";
import { SENTRY_THRESHOLDS } from "@/types/real-world-performance";

export const dynamic = "force-dynamic";

const FCP_DELAY = 2000; // ms

export default function FCPPage() {
  const { setLoading, loading } = useLoadState();

  useEffect(() => {
    // Reset loading to true when page mounts

    setTimeout(() => {
      setLoading(false);

      // Need to wait 100ms or vitals calculations won't be ready
      setTimeout(() => {
        triggerVisibilityChange(document, true);
      }, 100);
    }, FCP_DELAY);
  }, [setLoading]);

  return loading ? null : (
    <DemoLayout currentMetric="FCP">
      <DemoHeader
        vitalName="FCP"
        vitalDesc="First Contentful Paint"
        vitalColor="oklch(0.75 0.13 162)"
        isCore={true}
      >
        Measures the time from when a page starts loading to when any part of
        the page's content is first displayed.
      </DemoHeader>

      <Card className="mb-16">
        <CardHeader>
          <CardTitle>How FCP is Calculated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            You just experienced a {FCP_DELAY / 1000}-second delay before any
            content appeared. This entire page demonstrates First Contentful
            Paint.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                    style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                  >
                    1
                  </span>
                  <div>
                    <strong className="text-foreground">
                      Navigation Start
                    </strong>
                    <p className="text-muted-foreground text-sm mt-1">
                      Measurement begins when the user initiates navigation to
                      the webpage
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                    style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                  >
                    2
                  </span>
                  <div>
                    <strong className="text-foreground">
                      Resource Loading
                    </strong>
                    <p className="text-muted-foreground text-sm mt-1">
                      Browser fetches HTML, CSS, JavaScript, and other critical
                      resources
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                    style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                  >
                    3
                  </span>
                  <div>
                    <strong className="text-foreground">
                      DOM Construction
                    </strong>
                    <p className="text-muted-foreground text-sm mt-1">
                      HTML is parsed and DOM tree is constructed
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                    style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                  >
                    4
                  </span>
                  <div>
                    <strong className="text-foreground">First Paint</strong>
                    <p className="text-muted-foreground text-sm mt-1">
                      Time recorded when any text, image, or canvas element
                      first renders
                    </p>
                  </div>
                </li>
              </ol>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>FCP Formula:</strong> Navigation Start → First Content
                  Render Time
                </p>
              </div>
            </div>

            <div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-score-good" />
                  <div>
                    <span className="font-semibold">Good</span>
                    <span className="text-muted-foreground ml-2">
                      ≤{" "}
                      {SENTRY_THRESHOLDS.mobile["first-contentful-paint"].good}
                      ms
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-score-needs-improvement" />
                  <div>
                    <span className="font-semibold">Needs Improvement</span>
                    <span className="text-muted-foreground ml-2">
                      {SENTRY_THRESHOLDS.mobile["first-contentful-paint"].good}
                      ms -{" "}
                      {
                        SENTRY_THRESHOLDS.mobile["first-contentful-paint"]
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
                        SENTRY_THRESHOLDS.mobile["first-contentful-paint"]
                          .needsImprovement
                      }
                      ms
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-lg mt-6"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, oklch(0.75 0.13 162) 10%, transparent)",
                  borderLeft: "4px solid oklch(0.75 0.13 162)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                  />
                  <strong className="text-foreground">Real-world impact</strong>
                </div>
                <p className="text-sm text-muted-foreground">
                  Poor FCP makes users think the page is broken. Fast first
                  paint gives immediate feedback that the page is loading
                  successfully.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6 p-3 bg-muted/50 rounded">
            <strong>Note:</strong> You experienced {FCP_DELAY / 1000} seconds of
            blank screen before this content appeared. Real FCP is affected by
            server response time, render-blocking resources, and network
            conditions.
          </p>
        </CardContent>
      </Card>
    </DemoLayout>
  );
}

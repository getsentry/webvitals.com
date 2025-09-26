"use client";

import { useEffect, useState } from "react";
import DemoHeader from "@/components/demo/DemoHeader";
import DemoLayout from "@/components/demo/DemoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Heading from "@/components/ui/heading";
import { Progress } from "@/components/ui/progress";
import { SENTRY_THRESHOLDS } from "@/types/real-world-performance";

const LCP_DELAY = 3000; // ms

export default function LCPPage() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / LCP_DELAY) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 50);

    const showContentTimeout = setTimeout(() => {
      setVisible(true);
    }, LCP_DELAY);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(showContentTimeout);
    };
  }, []);

  return (
    <DemoLayout currentMetric="LCP">
      <DemoHeader
        vitalName="LCP"
        vitalDesc="Largest Contentful Paint"
        vitalColor="oklch(0.73 0.17 60)"
        isCore={true}
        supportedBrowsers={{ safari: false }}
      >
        Measures the time it takes for the largest text or image element to
        render on a webpage.
      </DemoHeader>

      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>How LCP is Calculated</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.73 0.17 60)" }}
                >
                  1
                </span>
                <div>
                  <strong className="text-foreground">Navigation Start</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    LCP measurement starts when the user navigates to the page
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.73 0.17 60)" }}
                >
                  2
                </span>
                <div>
                  <strong className="text-foreground">
                    Identify Candidates
                  </strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Browser identifies largest elements: images, videos, text
                    blocks
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.73 0.17 60)" }}
                >
                  3
                </span>
                <div>
                  <strong className="text-foreground">Track Largest</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Continuously monitor and track the largest visible element
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.73 0.17 60)" }}
                >
                  4
                </span>
                <div>
                  <strong className="text-foreground">Final Measurement</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    LCP is the time when the largest element finishes rendering
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>LCP Elements:</strong> &lt;img&gt;, &lt;video&gt;, text
                blocks, and background images are candidates.
              </p>
            </div>
            <div
              className="p-4 rounded-lg mb-4"
              style={{
                backgroundColor:
                  "color-mix(in srgb, oklch(0.73 0.17 60) 10%, transparent)",
                borderLeft: "4px solid oklch(0.73 0.17 60)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "oklch(0.73 0.17 60)" }}
                />
                <strong className="text-foreground">Real-world impact</strong>
              </div>
              <p className="text-sm text-muted-foreground">
                Slow LCP makes users think the page is broken. Users often leave
                if LCP exceeds 4 seconds. This delay simulates a large image or
                complex layout blocking page render.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-good" />
                <div>
                  <span className="font-semibold">Good</span>
                  <span className="text-muted-foreground ml-2">
                    ≤{" "}
                    {SENTRY_THRESHOLDS.mobile["largest-contentful-paint"].good /
                      1000}
                    s
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-needs-improvement" />
                <div>
                  <span className="font-semibold">Needs Improvement</span>
                  <span className="text-muted-foreground ml-2">
                    {SENTRY_THRESHOLDS.mobile["largest-contentful-paint"].good /
                      1000}
                    s -{" "}
                    {SENTRY_THRESHOLDS.mobile["largest-contentful-paint"]
                      .needsImprovement / 1000}
                    s
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-poor" />
                <div>
                  <span className="font-semibold">Poor</span>
                  <span className="text-muted-foreground ml-2">
                    &gt;{" "}
                    {SENTRY_THRESHOLDS.mobile["largest-contentful-paint"]
                      .needsImprovement / 1000}
                    s
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 lg:order-2">
          <CardContent>
            {!visible ? (
              <div className="border border-border rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
                <div className="w-full max-w-md text-center">
                  <p className="font-semibold text-foreground mb-4">
                    Loading LCP Content...
                  </p>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {progress.toFixed(0)}% •{" "}
                    {((progress / 100) * (LCP_DELAY / 1000)).toFixed(1)}s
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="border border-border rounded-lg p-6"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, oklch(0.73 0.17 60) 10%, transparent)",
                  borderColor: "oklch(0.73 0.17 60)",
                }}
              >
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    Large Content Block - LCP Element
                  </h3>
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    This large text content block serves as the Largest
                    Contentful Paint (LCP) element for this demonstration. The
                    browser measures LCP based on the largest visible content
                    element in the viewport, which in this case is this
                    substantial text area that contains multiple paragraphs and
                    significant textual content.
                  </p>
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    LCP candidates include images, video elements, and large
                    blocks of text like this one. The browser continuously
                    monitors these elements as the page loads and identifies the
                    largest one based on its rendered size in pixels. This
                    measurement is crucial for understanding when users can see
                    the main content of your webpage.
                  </p>
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    By delaying the appearance of this content block, we
                    simulate a slow-loading largest contentful paint, which
                    directly impacts the user's perception of page load
                    performance. Users will perceive the page as slow to load
                    when the LCP element takes a long time to render, even if
                    other smaller elements appear quickly.
                  </p>
                  <div
                    className="p-4 rounded-lg mt-6"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, oklch(0.73 0.17 60) 20%, transparent)",
                    }}
                  >
                    <p className="text-sm font-semibold text-foreground mb-2">
                      LCP Measurement Complete
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This large content area was delayed by {LCP_DELAY / 1000}{" "}
                      seconds, demonstrating how LCP measures the rendering time
                      of the largest visible element.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}

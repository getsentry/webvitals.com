"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoadState } from "@/hooks/useLoadState";
import { triggerVisibilityChange } from "@/lib/triggerVisibilityChange";
import { SENTRY_THRESHOLDS } from "@/types/real-world-performance";

const TTFB_DELAY = 2000; // ms - real server delay

export default function TTFBClient() {
  const { setLoading } = useLoadState();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      triggerVisibilityChange(document, true);
    }, 0);
  }, [setLoading]);

  return (
    <Card className="mb-16">
      <CardHeader>
        <CardTitle>How TTFB is Calculated</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">
          You just experienced a {TTFB_DELAY / 1000}-second server delay before
          any content appeared. This entire page demonstrates Time to First
          Byte.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.72 0.15 200)" }}
                >
                  1
                </span>
                <div>
                  <strong className="text-foreground">
                    Request Initiation
                  </strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Browser initiates request for resource (HTML, API, etc.)
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.72 0.15 200)" }}
                >
                  2
                </span>
                <div>
                  <strong className="text-foreground">Network Latency</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    DNS lookup, connection establishment, SSL handshake
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.72 0.15 200)" }}
                >
                  3
                </span>
                <div>
                  <strong className="text-foreground">Server Processing</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Database queries, API calls, content generation
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.72 0.15 200)" }}
                >
                  4
                </span>
                <div>
                  <strong className="text-foreground">
                    First Byte Response
                  </strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Server sends first byte back to client - TTFB measured here
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>TTFB Formula:</strong> Request Start → First Byte
                Received
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
                    {SENTRY_THRESHOLDS.mobile["time-to-first-byte"].good / 1000}
                    s
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-needs-improvement" />
                <div>
                  <span className="font-semibold">Needs Improvement</span>
                  <span className="text-muted-foreground ml-2">
                    {SENTRY_THRESHOLDS.mobile["time-to-first-byte"].good / 1000}
                    s -{" "}
                    {SENTRY_THRESHOLDS.mobile["time-to-first-byte"]
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
                    {SENTRY_THRESHOLDS.mobile["time-to-first-byte"]
                      .needsImprovement / 1000}
                    s
                  </span>
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-lg mt-6"
              style={{
                backgroundColor:
                  "color-mix(in srgb, oklch(0.72 0.15 200) 10%, transparent)",
                borderLeft: "4px solid oklch(0.72 0.15 200)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "oklch(0.72 0.15 200)" }}
                />
                <strong className="text-foreground">Real-world impact</strong>
              </div>
              <p className="text-sm text-muted-foreground">
                High TTFB delays everything else. Users see blank pages longer,
                and other resources can't start loading until the HTML arrives.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6 p-3 bg-muted/50 rounded">
          <strong>Note:</strong> You experienced {TTFB_DELAY / 1000} seconds of
          server delay before this content appeared. Real TTFB is affected by
          server response time, network conditions, and backend processing.
        </p>
      </CardContent>
    </Card>
  );
}

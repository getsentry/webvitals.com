"use client";

import { useEffect, useState } from "react";
import DemoHeader from "@/components/demo/DemoHeader";
import DemoLayout from "@/components/demo/DemoLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default function TTFBPage() {
  const [ttfbTime, setTtfbTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedDelay, setSimulatedDelay] = useState(0);

  useEffect(() => {
    // Get actual TTFB from navigation timing
    if (typeof window !== "undefined" && "performance" in window) {
      const navTiming = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      if (navTiming) {
        const actualTtfb = navTiming.responseStart - navTiming.requestStart;
        setTtfbTime(actualTtfb);
      }
    }
  }, []);

  const simulateSlowRequest = async (delay: number) => {
    setIsLoading(true);
    setSimulatedDelay(delay);

    const startTime = performance.now();

    try {
      // Make a request to our API route with artificial delay
      const response = await fetch(`/api/slow-response?delay=${delay}`);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      setSimulatedDelay(Math.round(responseTime));
    } catch (error) {
      setSimulatedDelay(delay); // fallback to expected delay
    } finally {
      setIsLoading(false);
    }
  };

  const getTtfbColor = (time: number) => {
    if (time <= 800) return "text-score-good";
    if (time <= 1800) return "text-score-needs-improvement";
    return "text-score-poor";
  };

  return (
    <DemoLayout>
      <DemoHeader
        vitalName="TTFB"
        vitalDesc="Time to First Byte"
        vitalColor="text-metric-ttfb"
        isCore={false}
      >
        Measures the duration from when a page starts loading to when the first
        byte of content is received from the server.
      </DemoHeader>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Current Page TTFB</h3>

          {ttfbTime !== null ? (
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={`text-sm ${getTtfbColor(ttfbTime)}`}
              >
                {Math.round(ttfbTime)}ms
              </Badge>
              <span className="text-sm text-muted-foreground">
                Time to receive first byte for this page
              </span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Calculating TTFB...
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">TTFB Simulation</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Test different server response times to see how they affect user
            experience.
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => simulateSlowRequest(200)}
                disabled={isLoading}
                variant="default"
                size="sm"
              >
                Fast Server (200ms)
              </Button>

              <Button
                onClick={() => simulateSlowRequest(1000)}
                disabled={isLoading}
                variant="secondary"
                size="sm"
              >
                Average Server (1s)
              </Button>

              <Button
                onClick={() => simulateSlowRequest(3000)}
                disabled={isLoading}
                variant="destructive"
                size="sm"
              >
                Slow Server (3s)
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Waiting for server response...</span>
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}

            {simulatedDelay > 0 && !isLoading && (
              <Badge
                variant="outline"
                className={`text-sm ${getTtfbColor(simulatedDelay)}`}
              >
                Simulated TTFB: {simulatedDelay}ms
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-8 p-8 rounded-lg border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">How is TTFB Calculated?</h3>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Time to First Byte (TTFB) measures the time between the request for
            a resource and when the first byte of a response begins to arrive.
          </p>

          <ol className="list-decimal ml-6 space-y-3">
            <li>
              <strong className="text-foreground">Request Initiation</strong>:
              The browser initiates a request for a resource (HTML document,
              image, script, etc.).
            </li>

            <li>
              <strong className="text-foreground">Network Latency</strong>: Time
              for the request to travel from the client to the server, including
              DNS lookup, connection establishment, and SSL handshake.
            </li>

            <li>
              <strong className="text-foreground">Server Processing</strong>:
              Time for the server to process the request, which may include
              database queries, API calls, and content generation.
            </li>

            <li>
              <strong className="text-foreground">Response Start</strong>: The
              server begins sending the response back to the client. TTFB is
              measured from request start to this moment.
            </li>
          </ol>

          <div className="bg-muted/50 p-4 rounded border-l-4 border-metric-ttfb">
            <strong>Good TTFB: ≤800ms</strong>
            <br />
            <strong>Needs Improvement: 800-1800ms</strong>
            <br />
            <strong>Poor TTFB: &gt;1800ms</strong>
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
            <strong>Note:</strong> TTFB is influenced by network conditions,
            server performance, and the complexity of the requested resource.
            It's particularly important for the initial HTML document as it
            affects when other resources can begin loading.
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}

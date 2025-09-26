"use client";

import { useState } from "react";
import DemoLayout from "@/components/demo/DemoLayout";
import DemoHeader from "@/components/demo/DemoHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function INPPage() {
  const [clickCount, setClickCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState<number | null>(null);

  // Simulate heavy computation to demonstrate INP
  const heavyComputation = () => {
    const startTime = performance.now();
    // Intentionally block the main thread
    while (performance.now() - startTime < 300) {
      // Heavy computation simulation
      Math.random() * 1000000;
    }
    return performance.now() - startTime;
  };

  const handleSlowButton = () => {
    const interactionStart = performance.now();
    setIsProcessing(true);
    
    // Use setTimeout to allow the UI to update before heavy computation
    setTimeout(() => {
      const computationTime = heavyComputation();
      setClickCount((prev) => prev + 1);
      setLastInteractionTime(computationTime);
      setIsProcessing(false);
    }, 0);
  };

  const handleFastButton = () => {
    const interactionStart = performance.now();
    setClickCount((prev) => prev + 1);
    setLastInteractionTime(performance.now() - interactionStart);
  };

  const handleResetButton = () => {
    setClickCount(0);
    setLastInteractionTime(null);
  };

  return (
    <DemoLayout>
      <DemoHeader
        vitalName="INP"
        vitalDesc="Interaction to Next Paint"
        vitalColor="text-metric-inp"
        isCore={true}
      >
        Measures the time from when a user interacts with a page to when the
        browser renders the visual response to that interaction.
      </DemoHeader>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">INP Demo</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Try these buttons to see how different types of interactions affect INP.
            The slow button simulates heavy JavaScript computation.
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleFastButton}
                variant="default"
                disabled={isProcessing}
              >
                Fast Response Button
              </Button>
              
              <Button 
                onClick={handleSlowButton}
                variant="destructive"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Slow Response Button"}
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
              
              {lastInteractionTime !== null && (
                <Badge 
                  variant="outline" 
                  className={`text-sm ${
                    lastInteractionTime > 200 
                      ? "text-score-poor" 
                      : lastInteractionTime > 100 
                      ? "text-score-needs-improvement" 
                      : "text-score-good"
                  }`}
                >
                  Last interaction: {Math.round(lastInteractionTime)}ms
                </Badge>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
            <strong>Note:</strong> Your browser may freeze temporarily when clicking the slow button.
            This demonstrates how blocking JavaScript affects user experience and INP scores.
          </p>
        </CardContent>
      </Card>

      <div className="mb-8 p-8 rounded-lg border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">How is INP Calculated?</h3>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Interaction to Next Paint (INP) measures responsiveness by observing
            the latency of all click, tap, and keyboard interactions during a
            user's visit to a page.
          </p>

          <ol className="list-decimal ml-6 space-y-3">
            <li>
              <strong className="text-foreground">Interaction Start</strong>:
              The measurement begins when the user initiates an interaction
              (click, tap, key press).
            </li>

            <li>
              <strong className="text-foreground">Event Processing</strong>:
              The browser processes event handlers, which may include JavaScript
              execution, DOM updates, and style calculations.
            </li>

            <li>
              <strong className="text-foreground">Next Paint</strong>:
              The browser renders the visual response to the interaction,
              updating the display with new content.
            </li>

            <li>
              <strong className="text-foreground">INP Calculation</strong>:
              INP reports the longest interaction latency observed during the
              page visit (or the 98th percentile for pages with many interactions).
            </li>
          </ol>

          <div className="bg-muted/50 p-4 rounded border-l-4 border-metric-inp">
            <strong>Good INP: ≤200ms</strong><br />
            <strong>Needs Improvement: 200-500ms</strong><br />
            <strong>Poor INP: &gt;500ms</strong>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
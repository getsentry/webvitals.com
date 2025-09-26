"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import DemoHeader from "@/components/demo/DemoHeader";
import DemoLayout from "@/components/demo/DemoLayout";

export const dynamic = "force-dynamic";

const LAYOUT_SHIFT_DELAY = 2000; // ms

export default function CLSPage() {
  const [showShift, setShowShift] = useState(false);
  const [shiftCount, setShiftCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowShift((prev) => !prev);
      setShiftCount((prev) => prev + 1);
    }, LAYOUT_SHIFT_DELAY);

    return () => clearInterval(interval);
  }, []);

  return (
    <DemoLayout>
      <DemoHeader
        vitalName="CLS"
        vitalDesc="Cumulative Layout Shift"
        vitalColor="text-metric-cls"
        isCore={true}
      >
        Measures the total amount of unexpected layout shifts that occur during
        the entire lifespan of a webpage.
      </DemoHeader>

      <div className="mb-8 p-8 rounded-lg border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Layout Shift Demo</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Watch how content shifts unexpectedly. Each shift contributes to the
          CLS score. Shift #{shiftCount}
        </p>

        <div className="space-y-4 min-h-[200px]">
          <div className="h-12 bg-muted rounded flex items-center px-4 text-sm">
            This content stays in place
          </div>

          <AnimatePresence mode="wait">
            {showShift && (
              <motion.div
                key="inserted-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 80, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-destructive/20 border border-destructive/40 rounded flex items-center px-4 text-sm text-destructive overflow-hidden"
              >
                Unexpected content appears, causing layout shift!
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-12 bg-muted rounded flex items-center px-4 text-sm">
            This content gets pushed down unexpectedly
          </div>

          <div className="h-12 bg-muted rounded flex items-center px-4 text-sm">
            And this content too
          </div>
        </div>
      </div>

      <div className="mb-8 p-8 rounded-lg border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">How is CLS Calculated?</h3>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Cumulative Layout Shift (CLS) measures visual stability by
            quantifying how much visible content shifts in the viewport.
          </p>

          <div className="bg-muted/50 p-4 rounded border-l-4 border-metric-cls">
            <strong>CLS = Impact Fraction × Distance Fraction</strong>
            <p className="text-xs text-muted-foreground mt-2">
              Impact fraction: portion of viewport affected by the shift
              <br />
              Distance fraction: distance moved relative to viewport
            </p>
          </div>

          <ol className="list-decimal ml-6 space-y-3">
            <li>
              <strong className="text-foreground">
                Layout Shift Detection
              </strong>
              : The browser monitors when visible elements change their start
              position between frames.
            </li>

            <li>
              <strong className="text-foreground">Impact Fraction</strong>:
              Measures what portion of the viewport is impacted by unstable
              elements moving between two frames.
            </li>

            <li>
              <strong className="text-foreground">Distance Fraction</strong>:
              Measures the distance that unstable elements have moved, relative
              to the viewport.
            </li>

            <li>
              <strong className="text-foreground">Session Windows</strong>: CLS
              groups layout shifts into session windows and reports the maximum
              session window value.
            </li>
          </ol>
        </div>
      </div>
    </DemoLayout>
  );
}

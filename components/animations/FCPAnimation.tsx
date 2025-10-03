"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function FCPAnimation({
  color,
  paused = true,
}: {
  color: string;
  paused?: boolean;
}) {
  const [state, setState] = useState<{
    fcpReached: boolean; // First content painted at 75ms
    allLoaded: boolean; // All content loaded later
    animationKey: number;
  }>({
    fcpReached: false,
    allLoaded: false,
    animationKey: 0,
  });

  useEffect(() => {
    if (paused) {
      setState({
        fcpReached: false,
        allLoaded: false,
        animationKey: 0,
      });
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];

    const runAnimation = () => {
      setState((prev) => ({
        fcpReached: false,
        allLoaded: false,
        animationKey: prev.animationKey + 1,
      }));

      timeouts.push(
        setTimeout(() => {
          setState((prev) => ({ ...prev, fcpReached: true }));
        }, 75),
      );

      timeouts.push(
        setTimeout(() => {
          setState((prev) => ({ ...prev, allLoaded: true }));
        }, 800),
      );

      timeouts.push(
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            fcpReached: false,
            allLoaded: false,
          }));
        }, 2300),
      );
    };

    let interval: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      runAnimation();
      interval = setInterval(runAnimation, 2800);
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, [paused]);

  const contentElements = [
    { id: 1, width: "70%", isFCP: true },
    { id: 2, width: "85%", isFCP: false },
    { id: 3, width: "50%", isFCP: false },
    { id: 4, width: "65%", isFCP: false },
  ];

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      <div className="absolute inset-4 pt-6 space-y-3">
        {contentElements.map((element) => {
          const shouldShow = element.isFCP ? state.fcpReached : state.allLoaded;

          return (
            <div
              key={element.id}
              className="relative flex items-center gap-3 min-h-[12px]"
            >
              {/* Content block */}
              <AnimatePresence>
                {shouldShow && (
                  <motion.div
                    key={`content-${element.id}-${state.animationKey}`}
                    className="h-3 rounded"
                    style={{
                      width: element.width,
                      backgroundColor: `color-mix(in srgb, ${color} ${element.isFCP ? 85 : 70}%, transparent)`,
                      border: element.isFCP
                        ? `2px solid color-mix(in srgb, ${color} 100%, transparent)`
                        : "none",
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* FCP counter */}
              {element.isFCP && (
                <div className="w-16 flex justify-end">
                  <AnimatePresence>
                    {shouldShow && (
                      <motion.div
                        key={`counter-${state.animationKey}`}
                        className="px-2 py-1 rounded text-xs font-mono"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
                          color: color,
                          border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        75ms
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

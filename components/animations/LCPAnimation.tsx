"use client";

import { Image } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function LCPAnimation({ color }: { color: string }) {
  const [state, setState] = useState<{
    showTimer: boolean;
    currentTime: number;
    loadedElements: number; // 0-4, which elements are loaded
    animationKey: number;
  }>({
    showTimer: false,
    currentTime: 0,
    loadedElements: 0,
    animationKey: 0,
  });

  useEffect(() => {
    const runAnimation = () => {
      // Reset
      setState((prev) => ({
        showTimer: true,
        currentTime: 0,
        loadedElements: 0,
        animationKey: prev.animationKey + 1,
      }));

      // Timer and progressive loading
      const startTime = Date.now();
      const duration = 568;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        // Determine how many elements should be loaded based on time
        let elementsToLoad = 0;
        if (elapsed >= 150) elementsToLoad = 1; // First text
        if (elapsed >= 250) elementsToLoad = 2; // Second text
        if (elapsed >= 350) elementsToLoad = 3; // Third text
        if (elapsed >= 568) elementsToLoad = 4; // Image (LCP)

        setState((prev) => ({
          ...prev,
          currentTime: Math.round(elapsed),
          loadedElements: elementsToLoad,
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Complete
          setState((prev) => ({
            ...prev,
            currentTime: 568,
            loadedElements: 4,
          }));

          // Reset after pause
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              showTimer: false,
              loadedElements: 0,
            }));
          }, 1500);
        }
      };

      animate();
    };

    setTimeout(() => {
      runAnimation();
      const interval = setInterval(runAnimation, 2500);
      return () => clearInterval(interval);
    }, 500);
  }, []);

  const elements = [
    { id: 1, type: "text", width: "100%", height: "12px" },
    { id: 2, type: "text", width: "75%", height: "12px" },
    { id: 3, type: "text", width: "60%", height: "12px" },
    { id: 4, type: "image", width: "200px", height: "80px" },
  ];

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      {/* Timer */}
      <AnimatePresence>
        {state.showTimer && (
          <motion.div
            key={`timer-${state.animationKey}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-mono"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
              color: color,
              border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
            }}
          >
            {state.currentTime}ms
          </motion.div>
        )}
      </AnimatePresence>

      <div className="inset-4 pt-12 p-8 flex gap-4">
        {/* Text content */}
        <div className="flex-1 space-y-3">
          {elements.slice(0, 3).map((element, index) => {
            const isLoaded = state.loadedElements > index;

            return (
              <motion.div
                key={element.id}
                className="h-3 rounded relative"
                style={{ width: element.width }}
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: isLoaded ? 0.8 : 0.3,
                  backgroundColor: isLoaded
                    ? `color-mix(in srgb, ${color} 70%, transparent)`
                    : `color-mix(in srgb, ${color} 30%, transparent)`,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Shimmer */}
                {!isLoaded && (
                  <motion.div
                    className="absolute inset-0 rounded"
                    style={{
                      background: `linear-gradient(90deg, 
                        transparent 0%, 
                        color-mix(in srgb, ${color} 40%, transparent) 50%, 
                        transparent 100%
                      )`,
                    }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Image (LCP element) */}
        <motion.div
          className="w-[200px] h-20 rounded border-2 relative flex items-center justify-center"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: state.loadedElements >= 4 ? 0.9 : 0.3,
            borderColor:
              state.loadedElements >= 4
                ? `color-mix(in srgb, ${color} 100%, transparent)`
                : `color-mix(in srgb, ${color} 50%, transparent)`,
            backgroundColor:
              state.loadedElements >= 4
                ? `color-mix(in srgb, ${color} 80%, transparent)`
                : `color-mix(in srgb, ${color} 15%, transparent)`,
            borderStyle: state.loadedElements >= 4 ? "solid" : "dashed",
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Shimmer */}
          {state.loadedElements < 4 && (
            <motion.div
              className="absolute inset-0 rounded"
              style={{
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  color-mix(in srgb, ${color} 25%, transparent) 50%, 
                  transparent 100%
                )`,
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}

          <Image
            className="w-6 h-6"
            style={{
              color:
                state.loadedElements >= 4
                  ? color
                  : `color-mix(in srgb, ${color} 60%, transparent)`,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function INPAnimation({ color }: { color: string }) {
  const [interactionState, setInteractionState] = useState<{
    cursorPosition: { x: number; y: number };
    isClicked: boolean;
    isOpen: boolean;
  }>({
    cursorPosition: { x: -20, y: -20 },
    isClicked: false,
    isOpen: false,
  });

  useEffect(() => {
    const simulateInteraction = () => {
      // Step 1: Cursor moves to dropdown button
      setInteractionState({
        cursorPosition: { x: 20, y: 5 },
        isClicked: false,
        isOpen: false,
      });

      // Step 2: Cursor clicks instantly after arriving (button press in)
      setTimeout(() => {
        setInteractionState((prev) => ({
          ...prev,
          isClicked: true,
        }));
      }, 1000);

      // Step 3: Button releases immediately after click
      setTimeout(() => {
        setInteractionState((prev) => ({
          ...prev,
          isClicked: false,
        }));
      }, 1100);

      // Step 4: Dropdown opens after INP delay (simulating processing time)
      setTimeout(() => {
        setInteractionState((prev) => ({
          ...prev,
          isOpen: true,
        }));
      }, 1800); // Longer delay to show the INP processing time

      // Step 5: Reset and hide cursor
      setTimeout(() => {
        setInteractionState({
          cursorPosition: { x: -20, y: -20 },
          isClicked: false,
          isOpen: false,
        });
      }, 3000);
    };

    // Initial delay before starting
    setTimeout(() => {
      simulateInteraction();
      const interval = setInterval(simulateInteraction, 4500);
      return () => clearInterval(interval);
    }, 500);
  }, []);

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      <div
        className="absolute inset-4 flex flex-col items-start"
        style={{ top: "15%", left: "10%" }}
      >
        {/* Dropdown Button */}
        <motion.div
          className="relative"
          animate={{
            scale:
              interactionState.isClicked && !interactionState.isOpen ? 0.98 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        >
          <motion.div
            className="px-4 py-2 rounded-lg border-2 text-sm font-medium flex items-center justify-between min-w-[140px] relative"
            style={{
              backgroundColor: interactionState.isOpen
                ? `color-mix(in srgb, ${color} 40%, transparent)`
                : `color-mix(in srgb, ${color} 30%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 60%, transparent)`,
            }}
            animate={{
              borderColor: interactionState.isOpen
                ? `color-mix(in srgb, ${color} 80%, transparent)`
                : `color-mix(in srgb, ${color} 60%, transparent)`,
            }}
          >
            {/* Skeleton text */}
            <div
              className="h-3 w-16 rounded"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 50%, transparent)`,
              }}
            />

            {/* Dropdown arrow */}
            <motion.div
              className="ml-2 text-xs"
              style={{ color: `color-mix(in srgb, ${color} 70%, transparent)` }}
              animate={{ rotate: interactionState.isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▼
            </motion.div>
          </motion.div>

          {/* Dropdown Menu - Skeleton Options */}
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{
              opacity: interactionState.isOpen ? 1 : 0,
              y: interactionState.isOpen ? 0 : -5,
              scale: interactionState.isOpen ? 1 : 0.98,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="absolute top-full mt-1 left-0 right-0 rounded-lg border-2 shadow-lg z-10 overflow-hidden"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 25%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 60%, transparent)`,
              pointerEvents: "none",
            }}
          >
            {[100, 80].map((width, index) => (
              <motion.div
                key={index}
                className="px-4 py-3 border-b"
                style={{
                  borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: interactionState.isOpen ? 1 : 0,
                }}
                transition={{
                  delay: interactionState.isOpen ? index * 0.1 : 0,
                  duration: 0.3,
                }}
              >
                <div
                  className="h-3 rounded"
                  style={{
                    width: `${width}px`,
                    backgroundColor: `color-mix(in srgb, ${color} 50%, transparent)`,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Animated Cursor */}
        <motion.div
          className="absolute w-4 h-4 pointer-events-none z-20"
          animate={{
            left: `${interactionState.cursorPosition.x}%`,
            top: `${interactionState.cursorPosition.y}%`,
            scale: interactionState.isClicked ? 0.9 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          <div
            className="w-4 h-4 rounded-full border-2"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 80%, transparent)`,
              borderColor: color,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function INPAnimation({
  color,
  paused = true,
}: {
  color: string;
  paused?: boolean;
}) {
  const [interactionState, setInteractionState] = useState<{
    cursorPosition: { x: number; y: number };
    isClicked: boolean;
    isOpen: boolean;
    timerMs: number;
  }>({
    cursorPosition: { x: -20, y: -20 },
    isClicked: false,
    isOpen: false,
    timerMs: 0,
  });

  useEffect(() => {
    if (paused) {
      setInteractionState({
        cursorPosition: { x: -20, y: -20 },
        isClicked: false,
        isOpen: false,
        timerMs: 0,
      });
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];
    let timerInterval: NodeJS.Timeout;

    const simulateInteraction = () => {
      setInteractionState({
        cursorPosition: { x: 20, y: 5 },
        isClicked: false,
        isOpen: false,
        timerMs: 0,
      });

      timeouts.push(
        setTimeout(() => {
          setInteractionState((prev) => ({
            ...prev,
            isClicked: true,
            timerMs: 0,
          }));

          // Start timer countdown
          timerInterval = setInterval(() => {
            setInteractionState((prev) => ({
              ...prev,
              timerMs: prev.timerMs + 10,
            }));
          }, 10);
        }, 1000),
      );

      timeouts.push(
        setTimeout(() => {
          setInteractionState((prev) => ({ ...prev, isClicked: false }));
        }, 1100),
      );

      timeouts.push(
        setTimeout(() => {
          setInteractionState((prev) => ({ ...prev, isOpen: true }));
          if (timerInterval) clearInterval(timerInterval);
        }, 1500),
      );

      timeouts.push(
        setTimeout(() => {
          setInteractionState({
            cursorPosition: { x: -20, y: -20 },
            isClicked: false,
            isOpen: false,
            timerMs: 0,
          });
        }, 3000),
      );
    };

    const timeout = setTimeout(simulateInteraction, 500);
    const interval = setInterval(simulateInteraction, 4500);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      if (timerInterval) clearInterval(timerInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [paused]);

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
        <div className="flex items-center gap-4">
          {/* Dropdown Button */}
          <motion.div
            className="relative"
            animate={{
              scale:
                interactionState.isClicked && !interactionState.isOpen
                  ? 0.98
                  : 1,
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
                style={{
                  color: `color-mix(in srgb, ${color} 70%, transparent)`,
                }}
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

          {/* Timer Display */}
          <AnimatePresence>
            {interactionState.cursorPosition.x > 0 &&
              interactionState.timerMs > 0 && (
                <motion.div
                  className="absolute px-3 py-2 rounded-lg border-2 text-sm font-mono"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
                    borderColor: `color-mix(in srgb, ${color} 60%, transparent)`,
                    color: color,
                    left: "160px",
                    top: "0px",
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {interactionState.timerMs}ms
                </motion.div>
              )}
          </AnimatePresence>
        </div>

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

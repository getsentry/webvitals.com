"use client";

import { Check, Server, Smartphone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function TTFBAnimation({
  color,
  paused = true,
}: {
  color: string;
  paused?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<{
    packetPosition: number; // 0-100
    showComplete: boolean;
    showTimer: boolean;
    currentTime: number; // Current elapsed time in ms
    animationKey: number; // For AnimatePresence
    showPacket: boolean; // Controls packet visibility for fade out
  }>({
    packetPosition: 0,
    showComplete: false,
    showTimer: false,
    currentTime: 0,
    animationKey: 0,
    showPacket: false,
  });

  useEffect(() => {
    if (paused) {
      setState({
        packetPosition: 0,
        showComplete: false,
        showTimer: false,
        currentTime: 0,
        animationKey: 0,
        showPacket: false,
      });
      return;
    }

    if (reducedMotion) {
      setState({
        packetPosition: 100,
        showComplete: true,
        showTimer: false,
        currentTime: 350,
        animationKey: 1,
        showPacket: false,
      });
      return;
    }

    const runAnimation = () => {
      setState((prev) => ({
        packetPosition: 0,
        showComplete: false,
        showTimer: true,
        currentTime: 0,
        animationKey: prev.animationKey + 1,
        showPacket: true,
      }));

      const startTime = Date.now();
      const duration = 350;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setState((prev) => ({
          ...prev,
          packetPosition: progress * 100,
          currentTime: Math.round(elapsed),
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setState((prev) => ({
            ...prev,
            showComplete: true,
            currentTime: 350,
          }));

          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              showComplete: false,
              showTimer: false,
              showPacket: false,
            }));
          }, 1000);
        }
      };

      animate();
    };

    const timeout = setTimeout(runAnimation, 500);
    const interval = setInterval(runAnimation, 2500);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [paused, reducedMotion]);

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      <div className="absolute inset-0 flex items-start justify-between px-8 pt-16">
        {/* Server (left) */}
        <div className="flex flex-col items-center space-y-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 60%, transparent)`,
            }}
          >
            <Server className="w-5 h-5" style={{ color: color }} />
          </div>
          <div className="text-xs font-medium" style={{ color: color }}>
            Server
          </div>
        </div>

        {/* Connection line with packet */}
        <div className="flex-1 relative mx-6 mt-5">
          {/* Timer */}
          <AnimatePresence mode="wait">
            {state.showTimer && (
              <motion.div
                key={`timer-${state.animationKey}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-mono"
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

          {/* Connection line */}
          <div
            className="absolute top-1/2 left-0 right-0 rounded-full"
            style={{
              height: "2px",
              backgroundColor: `color-mix(in srgb, ${color} 30%, transparent)`,
              transform: "translateY(-50%)",
            }}
          />

          {/* Traveling packet */}
          <AnimatePresence>
            {state.showPacket && (
              <motion.div
                key={`packet-${state.animationKey}`}
                className="absolute -top-[6px] w-3 h-3 rounded-full shadow-sm"
                style={{
                  backgroundColor: color,
                  left: `${Math.min(state.packetPosition, 95)}%`,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Client (right) */}
        <div className="flex flex-col items-center space-y-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center relative"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 60%, transparent)`,
            }}
          >
            <Smartphone className="w-5 h-5" style={{ color: color }} />

            {/* Success checkmark when packet arrives */}
            <AnimatePresence>
              {state.showComplete && (
                <motion.div
                  key={`checkmark-${state.animationKey}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="text-xs font-medium" style={{ color: color }}>
            Client
          </div>
        </div>
      </div>
    </div>
  );
}

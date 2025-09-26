"use client";

import { motion, Transition } from "motion/react";
import { useEffect, useState } from "react";

// LCP Background - Paint loading with blurred orbs
export function LCPBackground({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      <div
        className="absolute inset-0 bg-[length:20px_20px]"
        style={{
          backgroundImage: `linear-gradient(45deg, transparent 25%, color-mix(in srgb, ${color} 20%, transparent) 50%, transparent 75%)`,
        }}
      />
      <div
        className="absolute top-4 right-4 w-32 h-32 rounded-full blur-xl animate-pulse"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 40%, transparent)` }}
      />
      <div
        className="absolute bottom-8 left-8 w-24 h-24 rounded-full blur-lg animate-pulse"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 60%, transparent)`, animationDelay: "0.7s" }}
      />
    </div>
  );
}

// INP Background - Interaction ripples
export function INPBackground({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-ping"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 80%, transparent)`,
            animationDelay: "0.3s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full animate-ping"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 60%, transparent)`,
            animationDelay: "0.7s",
          }}
        />
      </div>
    </div>
  );
}

// CLS Background - Layout shift animation with reordering boxes
export function CLSBackground({ color }: { color: string }) {
  const initialBoxes = [
    `color-mix(in srgb, ${color} 60%, transparent)`,
    `color-mix(in srgb, ${color} 80%, transparent)`,
    `color-mix(in srgb, ${color} 70%, transparent)`,
    `color-mix(in srgb, ${color} 90%, transparent)`,
  ];

  const [order, setOrder] = useState(initialBoxes);

  useEffect(() => {
    const timeout = setTimeout(() => setOrder(shuffle([...order])), 2000);
    return () => clearTimeout(timeout);
  }, [order]);

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      <div className="absolute inset-4 p-2">
        <div style={container}>
          {order.map((backgroundColor, index) => (
            <motion.div
              key={backgroundColor}
              layout
              transition={spring}
              className="rounded"
              style={{
                ...item,
                backgroundColor,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// FCP Background - Content painting in
export function FCPBackground({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-4 left-4 w-16 h-2 rounded animate-pulse"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 80%, transparent)`,
          }}
        />
        <div
          className="absolute top-8 left-4 w-24 h-2 rounded animate-pulse"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 80%, transparent)`,
            animationDelay: "0.2s",
          }}
        />
        <div
          className="absolute top-12 left-4 w-20 h-2 rounded animate-pulse"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 80%, transparent)`,
            animationDelay: "0.4s",
          }}
        />
        <div
          className="absolute bottom-4 right-4 w-8 h-8 rounded-full animate-bounce"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 60%, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

// TTFB Background - Server response indicators
export function TTFBBackground({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 40%, transparent))`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div
            className="w-12 h-8 rounded animate-pulse"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 60%, transparent)`,
            }}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: color }}
          />
          <div
            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full animate-ping"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 75%, transparent)`,
              animationDelay: "0.5s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// CLS specific constants and utilities

function shuffle([...array]: string[]) {
  return array.sort(() => Math.random() - 0.5);
}

const spring: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 300,
};

const container: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridTemplateRows: "1fr 1fr",
  gap: 8,
  width: "100%",
  height: "100%",
};

const item: React.CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "4px",
  opacity: 0.8,
};
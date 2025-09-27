"use client";

import { motion, type Transition } from "motion/react";
import { useEffect, useState } from "react";

export function CLSAnimation({
  color,
  paused = true,
}: {
  color: string;
  paused?: boolean;
}) {
  const initialBoxes = [
    `color-mix(in srgb, ${color} 60%, transparent)`,
    `color-mix(in srgb, ${color} 80%, transparent)`,
    `color-mix(in srgb, ${color} 70%, transparent)`,
    `color-mix(in srgb, ${color} 90%, transparent)`,
  ];

  const [order, setOrder] = useState(initialBoxes);

  useEffect(() => {
    if (paused) {
      setOrder(initialBoxes);
      return;
    }
    const initialInterval = setTimeout(() => {
      setOrder((prevOrder) => shuffle([...prevOrder]));
    }, 300);
    const interval = setInterval(() => {
      setOrder((prevOrder) => shuffle([...prevOrder]));
    }, 1200);

    return () => {
      clearTimeout(initialInterval);
      clearInterval(interval);
    };
  }, [paused]);

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

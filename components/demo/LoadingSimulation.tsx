"use client";

import { useEffect, useState } from "react";

interface LoadingSimulationProps {
  duration: number; // in milliseconds
  vitalColor: string;
  vitalName: string;
  children: React.ReactNode;
}

export default function LoadingSimulation({
  duration,
  vitalColor,
  vitalName,
  children,
}: LoadingSimulationProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(currentProgress);

      if (currentProgress >= 100) {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 16); // ~60fps updates

    return () => clearInterval(interval);
  }, [duration]);

  if (isComplete) {
    return <>{children}</>;
  }

  return (
    <div className="border border-border rounded-lg p-4 mb-4 min-h-[200px] flex flex-col items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div
          className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: vitalColor }}
        >
          <svg
            className="w-8 h-8 text-white animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </div>

        <p className="font-semibold text-foreground mb-2">
          Loading {vitalName} Content...
        </p>

        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full transition-all duration-75 ease-out"
            style={{
              backgroundColor: vitalColor,
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {Math.round(progress)}% •{" "}
          {((progress / 100) * (duration / 1000)).toFixed(1)}s elapsed
        </p>
      </div>
    </div>
  );
}

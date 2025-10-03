"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { LighthouseScoreData } from "@/types/real-world-performance";

interface WebVitalsScore {
  mobile?: LighthouseScoreData;
  desktop?: LighthouseScoreData;
}

interface WebVitalsScoreContextType {
  scores: WebVitalsScore;
  setScores: (scores: WebVitalsScore) => void;
  hasScores: boolean;
}

const WebVitalsScoreContext = createContext<
  WebVitalsScoreContextType | undefined
>(undefined);

export function WebVitalsScoreProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<WebVitalsScore>({});

  const hasScores = Boolean(scores.mobile || scores.desktop);

  return (
    <WebVitalsScoreContext.Provider
      value={{
        scores,
        setScores,
        hasScores,
      }}
    >
      {children}
    </WebVitalsScoreContext.Provider>
  );
}

export function useWebVitalsScore() {
  const context = useContext(WebVitalsScoreContext);
  if (context === undefined) {
    throw new Error(
      "useWebVitalsScore must be used within a WebVitalsScoreProvider",
    );
  }
  return context;
}

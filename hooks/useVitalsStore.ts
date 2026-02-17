import { create } from "zustand";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

interface VitalsState {
  FCP: string;
  LCP: string;
  TTFB: string;
  CLS: string;
  INP: string;
}

export const useVitalsStore = create<VitalsState>()(() => ({
  FCP: "n/a",
  LCP: "n/a",
  TTFB: "n/a",
  CLS: "n/a",
  INP: "n/a",
}));

if (typeof window !== "undefined") {
  const onMetric = (m: { name: string; value: number }) => {
    useVitalsStore.setState({ [m.name]: String(m.value) });
  };
  onFCP(onMetric, { reportAllChanges: true });
  onLCP(onMetric, { reportAllChanges: true, reportSoftNavs: true });
  onTTFB(onMetric, { reportAllChanges: true });
  onCLS(onMetric, { reportAllChanges: true, reportSoftNavs: true });
  onINP(onMetric, { reportAllChanges: true, reportSoftNavs: true });
}

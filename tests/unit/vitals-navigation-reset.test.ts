import { describe, it, expect, beforeEach } from "vitest";
import { useVitalsStore } from "@/hooks/useVitalsStore";

const INITIAL_STATE = { FCP: "n/a", LCP: "n/a", TTFB: "n/a", CLS: "n/a", INP: "n/a" };

describe("useVitalsStore", () => {
  beforeEach(() => {
    useVitalsStore.setState(INITIAL_STATE);
  });

  it("initializes with all n/a", () => {
    expect(useVitalsStore.getState()).toMatchObject(INITIAL_STATE);
  });

  it("updates individual metrics via onMetric pattern", () => {
    useVitalsStore.setState({ LCP: "370" });
    useVitalsStore.setState({ CLS: "0.02" });
    expect(useVitalsStore.getState().LCP).toBe("370");
    expect(useVitalsStore.getState().CLS).toBe("0.02");
    // Others unchanged
    expect(useVitalsStore.getState().FCP).toBe("n/a");
  });

  it("full reset clears all populated metrics", () => {
    // Simulate metrics being populated
    useVitalsStore.setState({ FCP: "100", LCP: "370", TTFB: "50", CLS: "0.02", INP: "56" });
    // Simulate navigation reset
    useVitalsStore.setState(INITIAL_STATE);
    expect(useVitalsStore.getState()).toMatchObject(INITIAL_STATE);
  });

  it("partial updates don't clear other metrics", () => {
    useVitalsStore.setState({ LCP: "370", CLS: "0.02" });
    useVitalsStore.setState({ INP: "56" });
    expect(useVitalsStore.getState().LCP).toBe("370");
    expect(useVitalsStore.getState().CLS).toBe("0.02");
    expect(useVitalsStore.getState().INP).toBe("56");
  });
});

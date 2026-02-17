"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLoadState } from "@/hooks/useLoadState";
import { useVitalsStore } from "@/hooks/useVitalsStore";

export function VitalsNavigationReset() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      useLoadState.setState({ loading: true });
      useVitalsStore.setState({ FCP: "n/a", LCP: "n/a", TTFB: "n/a", CLS: "n/a", INP: "n/a" });
    }
  }, [pathname]);

  return null;
}

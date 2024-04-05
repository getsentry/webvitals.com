"use client";

import { useLoadState } from "./loadState";
import { useEffect } from "react";

export default function Home() {
  const { setLoading } = useLoadState();


  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, [setLoading]);

  return (
    <main>
      <h1>Web Vitals Demos</h1>
    </main>
  );
}

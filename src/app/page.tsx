"use client";
import Nav from "./nav";

import { useLoadState } from "./loadState";

export default function Home() {
  const { loading } = useLoadState();
  return loading ? null : (
    <main>
      <h1>Web Vitals Demos</h1>
    </main>
  );
}

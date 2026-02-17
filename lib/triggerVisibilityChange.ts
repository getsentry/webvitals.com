export function triggerVisibilityChange(
  document: Document,
  visibility: boolean,
) {
  try {
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      writable: true,
      configurable: true,
    });
  } catch {
    // Property already overridden (e.g. HMR reload) — writable, so assign directly
    (document as unknown as Record<string, unknown>).visibilityState = "hidden";
  }

  try {
    Object.defineProperty(document, "hidden", {
      value: visibility,
      writable: true,
      configurable: true,
    });
  } catch {
    (document as unknown as Record<string, unknown>).hidden = visibility;
  }

  document.dispatchEvent(new Event("visibilitychange"));

  // Restore real visibility state so subsequent soft navs aren't poisoned
  setTimeout(() => {
    (document as unknown as Record<string, unknown>).visibilityState =
      "visible";
    (document as unknown as Record<string, unknown>).hidden = false;
  }, 0);
}

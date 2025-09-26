export function triggerVisibilityChange(
  document: Document,
  hidden: boolean
) {
  Object.defineProperty(document, "visibilityState", {
    value: hidden ? "hidden" : "visible",
    writable: true,
  });
  Object.defineProperty(document, "hidden", {
    value: hidden,
    writable: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}
export function triggerVisibilityChange(
  document: Document,
  visibility: boolean,
) {
  Object.defineProperty(document, "visibilityState", {
    value: "hidden",
    writable: true,
  });
  Object.defineProperty(document, "hidden", {
    value: visibility,
    writable: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

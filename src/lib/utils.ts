import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function triggerVisibilityChange(
  document: Document,
  visibility: boolean
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

import { useEffect, useRef, useState } from "react";

interface UseScrollFadeReturn {
  scrollRef: React.RefObject<HTMLDivElement>;
  showLeftFade: boolean;
  showRightFade: boolean;
}

export function useScrollFade(dependency?: unknown): UseScrollFadeReturn {
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftFade(scrollLeft > 0);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // Delay initial check to let DOM settle after suggestions appear/disappear
    const timeoutId = setTimeout(checkScroll, 10);

    // Add scroll listener
    scrollElement.addEventListener("scroll", checkScroll);

    // Check on resize
    const resizeObserver = new ResizeObserver(() => {
      // Also delay resize checks
      setTimeout(checkScroll, 10);
    });
    resizeObserver.observe(scrollElement);

    return () => {
      clearTimeout(timeoutId);
      scrollElement.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [dependency]);

  return {
    scrollRef: scrollRef as React.RefObject<HTMLDivElement>,
    showLeftFade,
    showRightFade,
  };
}

import { useEffect, useState } from "react";

/**
 * Tracks whether the viewport is at/below `breakpoint`px, via matchMedia so
 * it updates live on resize/orientation change (not just on mount).
 */
export default function useIsMobile(breakpoint = 880) {
  const query = `(max-width: ${breakpoint}px)`;

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mql = window.matchMedia(query);
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mql.matches);

    if (mql.addEventListener) {
      mql.addEventListener("change", handleChange);
      return () => mql.removeEventListener("change", handleChange);
    }
    // Safari <14 fallback
    mql.addListener(handleChange);
    return () => mql.removeListener(handleChange);
  }, [query]);

  return isMobile;
}

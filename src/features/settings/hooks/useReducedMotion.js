import { useEffect, useState } from "react";

const STORAGE_KEY = "dls-reduced-motion";

/**
 * New: lets a user opt out of non-essential animation, independent of their
 * OS-level `prefers-reduced-motion` setting. Persists locally and toggles a
 * `.reduced-motion` class on <html> that Settings.css (and the rest of the
 * app, if adopted globally) can key off of.
 */
export default function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(reducedMotion));
    } catch {
      // localStorage may be unavailable (private mode, quota) — non-fatal.
    }
  }, [reducedMotion]);

  const toggleReducedMotion = () => setReducedMotion((prev) => !prev);

  return { reducedMotion, toggleReducedMotion };
}

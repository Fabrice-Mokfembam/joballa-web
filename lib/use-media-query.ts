"use client";

import { useEffect, useState } from "react";

/**
 * `null` until the first client read (avoid SSR/hydration mismatch).
 * Then `true` / `false` from `window.matchMedia`.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const m = window.matchMedia(query);
    const update = () => setMatches(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, [query]);

  return matches;
}

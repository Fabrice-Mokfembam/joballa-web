"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyJoballaTheme,
  getStoredJoballaTheme,
  JOBALLA_THEME_CHANGE_EVENT,
  JOBALLA_THEME_STORAGE_KEY,
  type JoballaThemeChoice,
} from "@/lib/theme/joballa-theme";

function readInitialTheme(): JoballaThemeChoice {
  if (typeof window === "undefined") return "system";
  return getStoredJoballaTheme();
}

type JoballaThemeContextValue = {
  theme: JoballaThemeChoice;
  resolved: "light" | "dark";
  setTheme: (choice: JoballaThemeChoice) => void;
};

const JoballaThemeContext = createContext<JoballaThemeContextValue | null>(null);

export function JoballaThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<JoballaThemeChoice>(readInitialTheme);
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    typeof window === "undefined" ? "light" : applyJoballaTheme(readInitialTheme()),
  );
  const [mounted] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (!mounted) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function sync() {
      setResolved(applyJoballaTheme(theme));
    }

    sync();

    if (theme !== "system") return undefined;

    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [mounted, theme]);

  useEffect(() => {
    if (!mounted) return;

    function onStorage(e: StorageEvent) {
      if (e.key !== JOBALLA_THEME_STORAGE_KEY) return;
      const next = getStoredJoballaTheme();
      setThemeState(next);
      setResolved(applyJoballaTheme(next));
    }

    function onThemeChange(e: Event) {
      const detail = (e as CustomEvent<JoballaThemeChoice>).detail;
      if (detail) {
        setThemeState(detail);
        setResolved(applyJoballaTheme(detail));
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(JOBALLA_THEME_CHANGE_EVENT, onThemeChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(JOBALLA_THEME_CHANGE_EVENT, onThemeChange);
    };
  }, [mounted]);

  const setTheme = useCallback((choice: JoballaThemeChoice) => {
    setThemeState(choice);
    try {
      window.localStorage.setItem(JOBALLA_THEME_STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    setResolved(applyJoballaTheme(choice));
    window.dispatchEvent(new CustomEvent(JOBALLA_THEME_CHANGE_EVENT, { detail: choice }));
  }, []);

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);

  return <JoballaThemeContext.Provider value={value}>{children}</JoballaThemeContext.Provider>;
}

export function useJoballaTheme(): JoballaThemeContextValue {
  const ctx = useContext(JoballaThemeContext);
  if (!ctx) {
    throw new Error("useJoballaTheme must be used within JoballaThemeProvider");
  }
  return ctx;
}

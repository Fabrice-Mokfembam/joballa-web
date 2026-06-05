export type JoballaThemeChoice = "system" | "light" | "dark";

export const JOBALLA_THEME_STORAGE_KEY = "joballa-theme";

export const JOBALLA_THEME_CHANGE_EVENT = "joballa-theme-change";

export function isJoballaThemeChoice(value: string | null): value is JoballaThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}

export function getStoredJoballaTheme(): JoballaThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(JOBALLA_THEME_STORAGE_KEY);
    if (isJoballaThemeChoice(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "system";
}

export function resolveJoballaTheme(choice: JoballaThemeChoice): "light" | "dark" {
  if (choice === "dark") return "dark";
  if (choice === "light") return "light";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/** Applies resolved light/dark to `<html data-joballa-theme>`. */
export function applyJoballaTheme(choice: JoballaThemeChoice): "light" | "dark" {
  const resolved = resolveJoballaTheme(choice);
  const root = document.documentElement;
  if (resolved === "dark") {
    root.setAttribute("data-joballa-theme", "dark");
  } else {
    root.removeAttribute("data-joballa-theme");
  }
  root.style.colorScheme = resolved;
  return resolved;
}

/** Inline script for `app/layout.tsx` — prevents wrong theme flash before React hydrates. */
export const JOBALLA_THEME_INIT_SCRIPT = `(function(){try{var k="joballa-theme";var t=localStorage.getItem(k);var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;if(dark){r.setAttribute("data-joballa-theme","dark");r.style.colorScheme="dark";}else{r.removeAttribute("data-joballa-theme");r.style.colorScheme="light";}}catch(e){}})();`;

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { onboardingCopy } from "@/features/onboarding/data/onboarding-copy";
import type { UiLanguage } from "@/features/learning/types/learning";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

const themeKey = "spreeda-theme";
const themeChangeEvent = "spreeda-theme-change";

let currentTheme: Theme = "light";
let themeInitialized = false;

function subscribeToTheme(onChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key !== themeKey) return;
    currentTheme = event.newValue === "dark" ? "dark" : "light";
    themeInitialized = true;
    onChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(themeChangeEvent, onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(themeChangeEvent, onChange);
  };
}

function getThemeSnapshot(): Theme {
  if (!themeInitialized) {
    try {
      currentTheme =
        window.localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
    } catch {
      currentTheme = "light";
    }
    themeInitialized = true;
  }

  return currentTheme;
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

type Props = {
  language: UiLanguage;
};

export function ThemeToggle({ language }: Props) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const copy = onboardingCopy[language];
  const isDark = theme === "dark";
  const [saveFailed, setSaveError] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme: Theme = isDark ? "light" : "dark";
    currentTheme = nextTheme;
    themeInitialized = true;

    let saveFailed = false;
    try {
      window.localStorage.setItem(themeKey, nextTheme);
    } catch {
      saveFailed = true;
    }

    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.dispatchEvent(new Event(themeChangeEvent));
    setSaveError(saveFailed);
  }

  return (
    <span className={styles.control}>
      <button
        type="button"
        className={styles.button}
        aria-pressed={isDark}
        aria-label={isDark ? copy.lightMode : copy.darkMode}
        title={isDark ? copy.lightMode : copy.darkMode}
        onClick={toggleTheme}
      >
        <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
        <span className={styles.label}>
          {isDark ? copy.lightMode : copy.darkMode}
        </span>
      </button>
      {saveFailed && (
        <span className={styles.status} role="status">
          {copy.themeSaveError}
        </span>
      )}
    </span>
  );
}

"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "fh-theme";
const EVENT = "fh-theme-change";

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    mq.removeEventListener("change", cb);
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): boolean {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Dark mode for public pages: stored choice, else the system preference. */
export function useDarkMode(): [boolean, () => void] {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const toggle = useCallback(() => {
    try {
      localStorage.setItem(KEY, getSnapshot() ? "light" : "dark");
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [dark, toggle];
}

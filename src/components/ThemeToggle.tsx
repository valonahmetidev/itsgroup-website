"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { writePreferenceCookie } from "@/lib/cookies";

const THEME_COOKIE = "its-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { dict } = useLocale();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    writePreferenceCookie(THEME_COOKIE, next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={className ?? "rounded-full p-2 hover:bg-surface"}
      aria-label={dark ? dict.nav.themeToLight : dict.nav.themeToDark}
      aria-pressed={dark}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

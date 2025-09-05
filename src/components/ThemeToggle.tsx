"use client";

import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/ui/kibo-ui/theme-switcher";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    // Get initial theme from localStorage or default to system
    const savedTheme = localStorage.getItem("theme");
    const isDark = document.documentElement.classList.contains("dark");

    if (savedTheme === "system" || !savedTheme) {
      setTheme("system");
    } else {
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);

    if (newTheme === "system") {
      localStorage.removeItem("theme");
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList[isDark ? "add" : "remove"]("dark");
    } else {
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList[
        newTheme === "dark" ? "add" : "remove"
      ]("dark");
    }
  };

  return (
    <ThemeSwitcher
      value={theme}
      onChange={handleThemeChange}
      defaultValue="system"
    />
  );
}

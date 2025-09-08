"use client";

import { useTheme } from "next-themes";
import { ThemeSwitcher } from "@/components/ui/kibo-ui/theme-switcher";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return (
    <ThemeSwitcher
      value={(theme as "light" | "dark" | "system") || "system"}
      onChange={handleThemeChange}
      defaultValue="system"
    />
  );
}

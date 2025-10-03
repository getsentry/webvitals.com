"use client";

import { useTheme } from "next-themes";
import { ThemeSwitcher } from "@/components/ui/kibo-ui/theme-switcher";
import { useLoadState } from "@/hooks/useLoadState";

export function ThemeToggle() {
  const { loading } = useLoadState();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return loading ? null : (
    <ThemeSwitcher
      value={(theme as "light" | "dark" | "system") || "system"}
      onChange={handleThemeChange}
      defaultValue="system"
    />
  );
}

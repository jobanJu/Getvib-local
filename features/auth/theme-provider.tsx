"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme || "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Initial check: if no default, use time-based logic or system preference
    const hour = new Date().getHours();
    const isDay = hour >= 8 && hour < 18;
    const initialTheme = isDay ? "light" : "dark";
    
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const effectiveTheme = savedTheme || initialTheme;

    setTheme(effectiveTheme);
    
    if (effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      const root = window.document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

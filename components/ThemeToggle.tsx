"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative flex h-9 w-9 items-center justify-center overflow-hidden border border-zinc-200 text-zinc-500 transition-all duration-200 hover:border-[#3f0075]/30 hover:bg-[#3f0075]/5 hover:text-[#3f0075] dark:border-zinc-700 dark:bg-[#161027] dark:text-zinc-400 dark:hover:border-[#c084fc]/40 dark:hover:bg-[#3f0075]/15 dark:hover:text-[#c084fc] ${className}`}
    >
      <span
        key={isDark ? "light" : "dark"}
        className="material-symbols-outlined text-[18px] leading-none animate-[spin_0.3s_ease-out_1]"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}

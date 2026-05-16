"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/**
 * Theme toggle. To avoid a hydration mismatch with the no-flash inline script,
 * the Sun/Moon icons swap purely via CSS using `.dark`-scoped utilities, and
 * aria attributes only assert their value after mount.
 */
export function ThemeToggle({ className }: Props) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";
  const ariaLabel = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Toggle theme";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mounted ? isDark : undefined}
      aria-label={ariaLabel}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/60 text-foreground/70 transition-colors",
        "hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Sun
        className="size-4 transition-all dark:scale-0 dark:-rotate-90 dark:opacity-0"
        aria-hidden
      />
      <Moon
        className="absolute size-4 scale-0 rotate-90 opacity-0 transition-all dark:scale-100 dark:rotate-0 dark:opacity-100"
        aria-hidden
      />
    </button>
  );
}

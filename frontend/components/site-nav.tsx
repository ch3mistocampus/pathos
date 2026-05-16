"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { isMockMode } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { LiveCountdown } from "@/components/live-countdown";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/strategies", label: "Strategies" },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Compact data-coded wordmark. 2x4 dot grid where the brand cell is emerald —
 * visualizes "five strategies, one breaks out" which is the project thesis.
 */
function PathosWordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-foreground"
      aria-label="Pathos — home"
    >
      <svg
        viewBox="0 0 22 12"
        className="h-3 w-[2.75rem]"
        aria-hidden
      >
        <g fill="currentColor" opacity="0.35">
          <circle cx="2" cy="3" r="1.4" />
          <circle cx="7" cy="3" r="1.4" />
          <circle cx="17" cy="3" r="1.4" />
          <circle cx="2" cy="9" r="1.4" />
          <circle cx="7" cy="9" r="1.4" />
          <circle cx="12" cy="9" r="1.4" />
          <circle cx="17" cy="9" r="1.4" />
        </g>
        <circle cx="12" cy="3" r="1.7" className="fill-primary" />
      </svg>
      <span className="text-sm font-semibold tracking-tight">Pathos</span>
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();

  // The Genomic Arena landing carries its own brand chrome.
  if (pathname?.startsWith("/arena")) return null;

  const showCountdown =
    pathname?.startsWith("/leaderboard") || pathname?.startsWith("/round");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <PathosWordmark />
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-9 items-center px-2 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-foreground/55 hover:text-foreground/90",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-x-2 -bottom-px h-px transition-opacity",
                      active ? "bg-primary opacity-100" : "opacity-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {showCountdown && <LiveCountdown />}
          {isMockMode() && (
            <Badge
              variant="outline"
              className="hidden h-6 text-[10px] font-mono uppercase tracking-wider text-foreground/55 sm:inline-flex"
            >
              mock data
            </Badge>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

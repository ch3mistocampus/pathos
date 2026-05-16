"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut, UserRound } from "lucide-react";
import { isMockMode } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LiveCountdown } from "@/components/live-countdown";
import { HelixMark } from "@/components/arena/icons";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/strategies", label: "Strategies" },
  { href: "/try", label: "Try prompts" },
  { href: "/round/round_1747403600", label: "Latest round" },
  { href: "/how-it-works", label: "How it works" },
] as const;

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href.startsWith("/round/")) {
    return pathname.startsWith("/round/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function PathosHuntWordmark() {
  return (
    <Link
      href="/"
      aria-label="PathosHunt — home"
      className="flex items-center gap-2.5"
    >
      <HelixMark className="h-7 w-6" />
      <div className="leading-tight">
        <div className="text-[15px] font-medium tracking-tight text-foreground">
          PathosHunt
        </div>
        <div className="hidden text-[10.5px] tracking-wide text-muted-foreground sm:block">
          Real-time competition for genetic intelligence
        </div>
      </div>
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const { user, ready, logout } = useAuth();

  const showCountdown =
    pathname?.startsWith("/leaderboard") || pathname?.startsWith("/round");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/55">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-6 lg:px-10">
        <PathosHuntWordmark />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[var(--primary-tint)] text-foreground"
                    : "text-muted-foreground hover:bg-[var(--accent-soft)] hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {showCountdown && <LiveCountdown />}
          {isMockMode() && (
            <span className="hidden h-6 items-center rounded-full border border-border/70 bg-background/70 px-2.5 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground sm:inline-flex">
              mock data
            </span>
          )}
          <ThemeToggle />
          {ready && user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/try"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 text-[13px] font-medium text-foreground hover:bg-muted"
              >
                <UserRound className="size-3.5" aria-hidden />
                {user.name}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label="Log out"
                title="Log out"
                onClick={logout}
              >
                <LogOut className="size-4" aria-hidden />
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-9 items-center gap-1.5 rounded-full pathos-cta px-4 text-[13px] font-medium sm:inline-flex"
            >
              Log in
              <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

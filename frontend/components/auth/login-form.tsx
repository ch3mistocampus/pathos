"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready, login } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/try";

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [next, ready, router, user]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email to start a session.");
      return;
    }
    login(email, name);
    router.replace(next);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-xl border border-border/70 bg-background/80 p-5 pathos-shadow"
    >
      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
          Work email
        </span>
        <input
          type="text"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@lab.org"
          autoComplete="email"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/30"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
          Display name
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Optional"
          autoComplete="name"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/30"
        />
      </label>
      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="pathos-cta">
        <LogIn className="size-4" aria-hidden />
        Log in
      </Button>
    </form>
  );
}

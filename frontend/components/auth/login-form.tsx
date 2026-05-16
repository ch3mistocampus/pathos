"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/try";

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [next, ready, router, user]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Username and password are both required.");
      return;
    }
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(next);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-xl border border-border/70 bg-background/80 p-5 pathos-shadow"
    >
      <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-foreground/70">
        Hackathon demo — sign in with username{" "}
        <code className="font-mono text-foreground">claude</code> and password{" "}
        <code className="font-mono text-foreground">hackathon</code>.
      </p>
      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
          Username
        </span>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="claude"
          autoComplete="username"
          spellCheck={false}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/30"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="hackathon"
          autoComplete="current-password"
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

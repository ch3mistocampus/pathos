import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to try PathosHunt prompt strategies.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-6 py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)]">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          Pathos beta access
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.025em] sm:text-5xl">
          Log in to test your own variant interpretation prompts.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/70">
          Use the prompt lab to tune strategy language, compare option presets,
          and inspect how a run would classify the current benchmark variant.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 rounded-xl bg-muted" />}>
        <LoginForm />
      </Suspense>
    </section>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[pathos] route error", error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-wide text-foreground/55">
        error
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Something went wrong.
      </h1>
      <p className="mt-3 text-sm text-foreground/70">
        The page failed to render. This is usually a transient API or rendering
        error — the Modal backend may be redeploying, or a response shape drifted
        from <code className="font-mono">lib/types.ts</code>. Retrying often
        resolves it.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-foreground/50">
          digest {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          Try again
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Back home
        </Link>
      </div>
    </section>
  );
}

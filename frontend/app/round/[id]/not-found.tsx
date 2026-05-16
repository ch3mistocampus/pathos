import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RoundNotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-wide text-foreground/55">
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Round not found.
      </h1>
      <p className="mt-3 text-sm text-foreground/70">
        No round matches this ID. It may have been pruned from history, or the
        URL is incorrect.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/leaderboard"
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          Back to leaderboard
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Home
        </Link>
      </div>
    </section>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RoundLoading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-7xl px-6 py-12"
    >
      <header className="mb-8 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-foreground/10" />
        <div className="h-8 w-80 animate-pulse rounded bg-foreground/10" />
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-foreground/10" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-foreground/10" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-foreground/10" />
        </div>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <div className="h-4 w-56 animate-pulse rounded bg-foreground/10" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-foreground/10" />
                <div className="h-3 w-full animate-pulse rounded bg-foreground/10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-foreground/10" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-[24rem]">
            <CardHeader className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-foreground/10" />
              <div className="h-3 w-20 animate-pulse rounded bg-foreground/10" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-foreground/10" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-foreground/10" />
              <div className="h-3 w-4/6 animate-pulse rounded bg-foreground/10" />
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 font-mono text-xs uppercase tracking-wide text-foreground/45">
        loading round
      </p>
    </section>
  );
}

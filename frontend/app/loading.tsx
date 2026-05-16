export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-16 text-sm text-foreground/55"
    >
      <span
        aria-hidden
        className="inline-block size-3 animate-pulse rounded-full bg-foreground/40"
      />
      <span className="font-mono text-xs uppercase tracking-wide">loading</span>
    </section>
  );
}

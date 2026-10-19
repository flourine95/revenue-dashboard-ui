export default function Loading() {
  return (
    <main id="main-content" className="min-h-svh bg-surface">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div role="status" aria-live="polite" className="sr-only">
          Loading…
        </div>

        <div className="flex items-center gap-3">
          <div className="size-10 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-40 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
            <div className="h-2 w-24 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
          </div>
        </div>

        <div className="mt-6 h-[640px] animate-pulse rounded-[28px] bg-card ring-1 ring-foreground/5" />
      </div>
    </main>
  )
}

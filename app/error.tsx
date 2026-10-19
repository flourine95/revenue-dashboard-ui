"use client"

import { AlertCircle, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main
      id="main-content"
      className="flex min-h-svh items-center justify-center bg-surface px-6"
    >
      <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-foreground/5">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </span>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message ||
            "The dashboard could not be loaded. Check that the API is running on port 4000."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-ink/90 focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
      </div>
    </main>
  )
}

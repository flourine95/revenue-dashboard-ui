import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-svh items-center justify-center bg-surface px-6"
    >
      <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-foreground/5">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          This page does not exist
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The dashboard, sign-in page and admin screen are the only routes in
          this demo.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-ink/90 focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}

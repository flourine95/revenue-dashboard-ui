import Link from "next/link"
import { redirect } from "next/navigation"
import { BarChart3, TrendingUp } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { getSessionUser } from "@/lib/api/server"

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user !== null) redirect("/")

  return (
    <main className="grid min-h-svh bg-surface lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-white/10">
            <BarChart3 className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Revenue Dashboard
          </span>
        </div>

        <div className="max-w-md">
          <p className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase">
            Weekly performance
          </p>
          <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight">
            Every service, one clear picture.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Revenue, covers and labour in a single view — compared with the
            period before it, annotated with the events that moved the numbers.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs text-white/50">
            <TrendingUp className="size-4 text-emerald-400" />
            POS + Eatclub revenue, daily covers, and labour cost.
          </div>
        </div>

        <p className="text-xs text-white/35">
          Revenue Dashboard · demo environment
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-2xl bg-ink text-white">
              <BarChart3 className="size-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Revenue Dashboard
            </span>
          </div>

          <p className="mt-8 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase lg:mt-0">
            Admin access
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to see this week&apos;s performance and manage the
            underlying numbers.
          </p>

          <LoginForm />

          <p className="mt-6 text-xs text-muted-foreground">
            Trouble signing in? Make sure the API is running on{" "}
            <code className="rounded bg-black/5 px-1 py-0.5">
              localhost:4000
            </code>
            .
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              Back to dashboard
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

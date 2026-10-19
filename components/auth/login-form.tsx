"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { login } from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DEMO = { email: "admin@revenue.local", password: "admin1234" }

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      await login({ email, password })
      router.replace("/")
      router.refresh()
    } catch (cause) {
      const message =
        cause instanceof ApiError
          ? cause.message
          : "Cannot reach the API. Check that it is running on port 4000."
      setError(message)
      setPending(false)
    }
  }

  function fillDemo() {
    setEmail(DEMO.email)
    setPassword(DEMO.password)
    setError(null)
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@restaurant.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="h-10 rounded-xl bg-white/80 px-3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="h-10 rounded-xl bg-white/80 px-3"
        />
      </div>

      {error !== null && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-xl bg-ink text-sm font-medium text-white hover:bg-ink/90"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="rounded-xl border border-dashed border-black/10 bg-black/[0.02] px-3 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
          <span>
            Demo account:{" "}
            <span className="text-foreground">admin@revenue.local</span> /{" "}
            <span className="text-foreground">admin1234</span>
          </span>
          <button
            type="button"
            onClick={fillDemo}
            className="shrink-0 font-medium text-foreground underline-offset-4 hover:underline"
          >
            Use it
          </button>
        </div>
      </div>
    </form>
  )
}

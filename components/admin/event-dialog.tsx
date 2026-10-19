"use client"

import { useState } from "react"
import { Loader2, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createAdminEvent, updateAdminEvent } from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/error"
import type { EventDto } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export function EventDialog({
  date,
  event,
  onClose,
  onSaved,
}: {
  date: string
  event?: EventDto
  onClose: () => void
  onSaved: () => void
}) {
  const editing = event !== undefined
  const [dateValue, setDateValue] = useState(event?.date ?? date)
  const [type, setType] = useState<"positive" | "negative">(
    event?.type ?? "positive"
  )
  const [title, setTitle] = useState(event?.title ?? "")
  const [description, setDescription] = useState(event?.description ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault()

    if (title.trim() === "") {
      setError("A title is required.")
      return
    }

    setPending(true)
    setError(null)

    const input = {
      date: dateValue,
      type,
      title: title.trim(),
      description: description.trim() === "" ? null : description.trim(),
    }

    try {
      if (editing) {
        await updateAdminEvent(event.id, input)
      } else {
        await createAdminEvent(input)
      }
      onSaved()
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "Could not save this event."
      )
      setPending(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>
            Events are drawn as annotations above the chart.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                required
                value={dateValue}
                onChange={(input) => setDateValue(input.target.value)}
                className="h-9 bg-white/80"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <div className="flex h-9 items-center gap-1 rounded-lg border border-input bg-white/80 p-1">
                <button
                  type="button"
                  aria-pressed={type === "positive"}
                  onClick={() => setType("positive")}
                  className={cn(
                    "inline-flex h-full items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none",
                    type === "positive"
                      ? "bg-positive/10 text-positive"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingUp className="size-3.5" />
                  Positive
                </button>
                <button
                  type="button"
                  aria-pressed={type === "negative"}
                  onClick={() => setType("negative")}
                  className={cn(
                    "inline-flex h-full items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none",
                    type === "negative"
                      ? "bg-negative/10 text-negative"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingDown className="size-3.5" />
                  Negative
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              required
              maxLength={120}
              value={title}
              onChange={(input) => setTitle(input.target.value)}
              placeholder="Local festival boost"
              className="h-9 bg-white/80"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-description">Description (optional)</Label>
            <Textarea
              id="event-description"
              maxLength={500}
              value={description}
              onChange={(input) => setDescription(input.target.value)}
              placeholder="What happened and how it affected service?"
              className="min-h-20 bg-white/80"
            />
          </div>

          {error !== null && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

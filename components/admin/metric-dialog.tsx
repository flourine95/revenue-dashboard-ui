"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
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
import { putAdminMetric } from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/error"
import type { MetricDto } from "@/lib/api/types"

function NumberField({
  id,
  label,
  value,
  onChange,
  step,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  step: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        className="h-9 bg-white/80"
      />
      {hint !== undefined && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export function MetricDialog({
  date,
  metric,
  onClose,
  onSaved,
}: {
  date: string
  metric?: MetricDto
  onClose: () => void
  onSaved: () => void
}) {
  const editing = metric !== undefined
  const [dateValue, setDateValue] = useState(metric?.date ?? date)
  const [posRevenue, setPosRevenue] = useState(
    metric === undefined ? "" : String(metric.posRevenue)
  )
  const [eatclubRevenue, setEatclubRevenue] = useState(
    metric === undefined ? "" : String(metric.eatclubRevenue)
  )
  const [labourCost, setLabourCost] = useState(
    metric === undefined ? "" : String(metric.labourCost)
  )
  const [covers, setCovers] = useState(
    metric === undefined ? "" : String(metric.covers)
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const numbers = [posRevenue, eatclubRevenue, labourCost, covers].map(Number)
    if (numbers.some((value) => !Number.isFinite(value) || value < 0)) {
      setError("Every field must be a non-negative number.")
      return
    }
    if (!Number.isInteger(Number(covers))) {
      setError("Covers must be a whole number.")
      return
    }

    setPending(true)
    setError(null)

    try {
      await putAdminMetric(dateValue, {
        posRevenue: numbers[0],
        eatclubRevenue: numbers[1],
        labourCost: numbers[2],
        covers: numbers[3],
      })
      onSaved()
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "Could not save this day."
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
          <DialogTitle>
            {editing ? "Edit daily metrics" : "Add daily metrics"}
          </DialogTitle>
          <DialogDescription>
            Saving replaces the whole day. Revenue values are in USD.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="metric-date">Date</Label>
            <Input
              id="metric-date"
              type="date"
              required
              disabled={editing}
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className="h-9 bg-white/80"
            />
            {editing && (
              <p className="text-[11px] text-muted-foreground">
                Delete and re-add the day to move it to another date.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="metric-pos"
              label="POS revenue"
              value={posRevenue}
              onChange={setPosRevenue}
              step="0.01"
            />
            <NumberField
              id="metric-eatclub"
              label="Eatclub revenue"
              value={eatclubRevenue}
              onChange={setEatclubRevenue}
              step="0.01"
            />
            <NumberField
              id="metric-labour"
              label="Labour cost"
              value={labourCost}
              onChange={setLabourCost}
              step="0.01"
            />
            <NumberField
              id="metric-covers"
              label="Covers"
              value={covers}
              onChange={setCovers}
              step="1"
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
              {editing ? "Save changes" : "Add day"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

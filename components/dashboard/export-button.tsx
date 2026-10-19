"use client"

import { useState } from "react"
import type { RefObject } from "react"
import { toPng } from "html-to-image"
import { Download, Loader2 } from "lucide-react"

/**
 * Renders the referenced card to a PNG and triggers a download.
 * Elements marked with `data-export-ignore="true"` (the controls) are skipped.
 */
export function ExportButton({
  targetRef,
  filename,
}: {
  targetRef: RefObject<HTMLElement | null>
  filename: string
}) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleExport() {
    const node = targetRef.current
    if (node === null || pending) return

    setPending(true)
    setFailed(false)

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (element) => {
          if (!(element instanceof HTMLElement)) return true
          return element.dataset.exportIgnore !== "true"
        },
      })

      const link = document.createElement("a")
      link.href = dataUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("PNG export failed", error)
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={pending}
      title={
        failed
          ? "Export failed — please try again"
          : "Download this card as a PNG"
      }
      className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3.5 text-xs font-medium whitespace-nowrap text-foreground ring-1 ring-black/10 transition-all hover:bg-black/[0.03] disabled:cursor-wait disabled:opacity-60 sm:text-[13px] dark:bg-transparent dark:ring-white/15"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Download className="size-3.5" />
      )}
      {pending ? "Exporting…" : "Export PNG"}
    </button>
  )
}

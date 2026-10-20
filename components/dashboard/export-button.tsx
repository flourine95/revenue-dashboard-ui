"use client"

import { useState } from "react"
import type { RefObject } from "react"
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
      // Load the exporter only when the visitor asks for a PNG.
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (element) => {
          if (!(element instanceof HTMLElement)) return true
          // Only skip the marked element and its descendants. A plain
          // `dataset` check would also test ancestors and could blank out
          // the whole card if the attribute were ever moved up the tree.
          return element.closest('[data-export-ignore="true"]') === null
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
        failed ? "Export failed. Try again." : "Download this card as a PNG"
      }
      aria-busy={pending}
      className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3.5 text-xs font-medium whitespace-nowrap text-foreground ring-1 ring-black/10 transition-colors hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 sm:text-[13px] dark:bg-transparent dark:ring-white/15"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Download className="size-3.5" />
      )}
      Export PNG
    </button>
  )
}

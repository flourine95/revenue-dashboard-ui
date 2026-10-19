"use client"

import { LogOut } from "lucide-react"
import type { User } from "@/lib/api/types"

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function UserMenu({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 py-1 pr-1 pl-1 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <span className="grid size-7 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
        {initials(user.name)}
      </span>
      <span className="hidden text-xs font-medium sm:block">{user.name}</span>
      <button
        type="button"
        onClick={onLogout}
        aria-label="Sign out"
        title="Sign out"
        className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
      >
        <LogOut className="size-3.5" />
      </button>
    </div>
  )
}

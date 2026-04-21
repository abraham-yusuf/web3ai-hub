"use client"

import { useMemo, useState } from "react"

type ProgressTrackerProps = {
  pageSlug: string
  initialCompleted?: boolean
}

export function ProgressTracker({ pageSlug, initialCompleted = false }: ProgressTrackerProps) {
  const storageKey = useMemo(() => `learn_progress_${pageSlug}`, [pageSlug])
  const [completed, setCompleted] = useState(() => {
    if (typeof window === "undefined") {
      return initialCompleted
    }

    const stored = window.localStorage.getItem(`learn_progress_${pageSlug}`)
    if (stored === "1") return true
    if (stored === "0") return false

    return initialCompleted
  })

  async function toggle() {
    const next = !completed
    setCompleted(next)
    window.localStorage.setItem(storageKey, next ? "1" : "0")

    try {
      await fetch("/api/learn/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageSlug, completed: next }),
      })
    } catch {
      // ignore sync failure; local state tetap tersimpan
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">Progress Lesson</p>
        <p className="text-xs text-muted-foreground">Status tersimpan lokal dan disinkronkan saat login.</p>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-medium ${completed ? "bg-green-600 text-white" : "border"}`}
      >
        {completed ? "Completed" : "Mark Complete"}
      </button>
    </div>
  )
}

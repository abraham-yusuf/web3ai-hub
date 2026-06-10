"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  weeklyProgress: boolean[]
  lastActiveDate: string | null
}

interface StreakWidgetProps {
  className?: string
}

export function StreakWidget({ className }: StreakWidgetProps) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStreak() {
      try {
        const res = await fetch("/api/gamification/streak")
        if (!res.ok) throw new Error("Failed to fetch streak data")
        const data = await res.json()
        setStreak(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchStreak()
  }, [])

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-16 rounded bg-muted" />
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-8 w-8 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !streak) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <p className="text-sm text-destructive">Unable to load streak</p>
      </div>
    )
  }

  const isStreakActive = streak.currentStreak > 0

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current Streak
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={cn(
              "text-3xl font-bold",
              isStreakActive ? "text-orange-500" : "text-muted-foreground"
            )}>
              {streak.currentStreak}
            </span>
            <span className="text-sm text-muted-foreground">
              day{streak.currentStreak !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          isStreakActive
            ? "bg-orange-500/20 text-orange-500"
            : "bg-muted text-muted-foreground"
        )}>
          <FlameIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">This Week</p>
        <div className="flex gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{day}</span>
              <div
                className={cn(
                  "h-8 w-8 rounded-md border flex items-center justify-center",
                  streak.weeklyProgress[i]
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-muted/50 border-border"
                )}
              >
                {streak.weeklyProgress[i] && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Longest
          </p>
          <p className="mt-0.5 text-lg font-semibold">{streak.longestStreak}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Total Days
          </p>
          <p className="mt-0.5 text-lg font-semibold">{streak.totalActiveDays}</p>
        </div>
      </div>
    </div>
  )
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12.763 2.146a5.5 5.5 0 0 1 3.584 6.94l-7.196 6.388a2.25 2.25 0 0 1-3.948-2.336l.37-5.76a5.5 5.5 0 0 1 1.18-4.38l.008-.009a.75.75 0 0 1 1.01-.06l1.75 1.75a.75.75 0 0 1-.06 1.01l-2.5 2.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 1.06-1.06l.94.94a5.5 5.5 0 0 1-.06 1.01l-5.76.37a2.25 2.25 0 0 1-2.336-3.948l6.388-7.196a5.5 5.5 0 0 1 6.94-3.584l.353.013a.75.75 0 0 1 .06 1.01l-1.75 1.75a.75.75 0 0 1-1.01-.06l-.94-.94a.75.75 0 0 1 .06-1.01l.47-.47a.75.75 0 0 1 1.01.06l1.5 1.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
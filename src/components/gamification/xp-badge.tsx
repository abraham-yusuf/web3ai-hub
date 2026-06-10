"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface XpData {
  currentXp: number
  level: number
  xpToNextLevel: number
  xpForCurrentLevel: number
  totalXp: number
}

interface XpBadgeProps {
  className?: string
  showProgress?: boolean
}

export function XpBadge({ className, showProgress = true }: XpBadgeProps) {
  const [xp, setXp] = useState<XpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchXp() {
      try {
        const res = await fetch("/api/gamification/xp")
        if (!res.ok) throw new Error("Failed to fetch XP data")
        const data = await res.json()
        setXp(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchXp()
  }, [])

  if (loading) {
    return (
      <div className={cn("inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5", className)}>
        <div className="animate-pulse h-5 w-5 rounded-full bg-muted" />
        <div className="animate-pulse h-4 w-16 rounded bg-muted" />
      </div>
    )
  }

  if (error || !xp) {
    return (
      <div className={cn("inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5", className)}>
        <p className="text-xs text-destructive">Error</p>
      </div>
    )
  }

  const xpInCurrentLevel = xp.currentXp - xp.xpForCurrentLevel
  const xpNeeded = xp.xpToNextLevel - xp.xpForCurrentLevel
  const progressPercent = Math.min((xpInCurrentLevel / xpNeeded) * 100, 100)

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full",
          "bg-gradient-to-br from-purple-500 to-blue-500",
          "text-white font-bold text-sm shadow-lg shadow-purple-500/20"
        )}
      >
        {xp.level}
        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white border-2 border-card">
          ★
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-foreground">
            {xp.currentXp.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">XP</span>
        </div>

        {showProgress && (
          <div className="mt-1 w-32">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Level {xp.level}</span>
              <span>Level {xp.level + 1}</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {xpInCurrentLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface XpProgressBarProps {
  className?: string
}

export function XpProgressBar({ className }: XpProgressBarProps) {
  const [xp, setXp] = useState<XpData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchXp() {
      try {
        const res = await fetch("/api/gamification/xp")
        if (!res.ok) return
        const data = await res.json()
        setXp(data)
      } finally {
        setLoading(false)
      }
    }
    fetchXp()
  }, [])

  if (loading || !xp) {
    return (
      <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
        <div className="animate-pulse h-full bg-muted-foreground/30" />
      </div>
    )
  }

  const xpInCurrentLevel = xp.currentXp - xp.xpForCurrentLevel
  const xpNeeded = xp.xpToNextLevel - xp.xpForCurrentLevel
  const progressPercent = Math.min((xpInCurrentLevel / xpNeeded) * 100, 100)

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  )
}

interface XpRingProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function XpRing({ className, size = "md" }: XpRingProps) {
  const [xp, setXp] = useState<XpData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchXp() {
      try {
        const res = await fetch("/api/gamification/xp")
        if (!res.ok) return
        const data = await res.json()
        setXp(data)
      } finally {
        setLoading(false)
      }
    }
    fetchXp()
  }, [])

  const sizeClasses = {
    sm: "h-12 w-12 text-sm",
    md: "h-16 w-16 text-lg",
    lg: "h-20 w-20 text-xl",
  }

  const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5
  const radius = size === "sm" ? 18 : size === "md" ? 24 : 30
  const circumference = 2 * Math.PI * radius

  if (loading || !xp) {
    return (
      <div className={cn("flex items-center justify-center rounded-full bg-muted", sizeClasses[size], className)}>
        <div className="animate-pulse h-full w-full rounded-full bg-muted-foreground/20" />
      </div>
    )
  }

  const xpInCurrentLevel = xp.currentXp - xp.xpForCurrentLevel
  const xpNeeded = xp.xpToNextLevel - xp.xpForCurrentLevel
  const progressPercent = Math.min((xpInCurrentLevel / xpNeeded) * 100, 100)
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="url(#xp-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-foreground">{xp.level}</span>
      </div>
    </div>
  )
}
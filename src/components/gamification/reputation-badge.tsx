"use client"

import { cn } from "@/lib/utils"
import type { TrustLevel } from "@prisma/client"

// Static mapping (mirrors server-side getTrustMeta — no server import needed)
const TRUST_DISPLAY: Record<
  TrustLevel,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  NEWCOMER: {
    label: "Newcomer",
    icon: "🌱",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
  },
  CONTRIBUTOR: {
    label: "Contributor",
    icon: "⭐",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  TRUSTED: {
    label: "Trusted",
    icon: "🛡️",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  EXPERT: {
    label: "Expert",
    icon: "🏆",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  GUARDIAN: {
    label: "Guardian",
    icon: "💎",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
}

interface ReputationBadgeProps {
  trustLevel: TrustLevel
  reputation?: number
  size?: "sm" | "md" | "lg"
  showScore?: boolean
  className?: string
}

/**
 * Displays a user's trust-level badge with optional reputation score.
 *
 * Usage:
 *   <ReputationBadge trustLevel="TRUSTED" reputation={720} />
 *   <ReputationBadge trustLevel="EXPERT" size="lg" showScore />
 */
export function ReputationBadge({
  trustLevel,
  reputation,
  size = "md",
  showScore = false,
  className,
}: ReputationBadgeProps) {
  const meta = TRUST_DISPLAY[trustLevel] ?? TRUST_DISPLAY.NEWCOMER

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        meta.bg,
        meta.border,
        meta.color,
        sizeClasses[size],
        className,
      )}
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
      {showScore && reputation !== undefined && (
        <span className="opacity-70">({reputation.toLocaleString()})</span>
      )}
    </span>
  )
}

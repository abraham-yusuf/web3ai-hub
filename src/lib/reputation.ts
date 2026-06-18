/**
 * Reputation system: trust scores, karma, and trust-level tiers.
 *
 * Reputation is a composite score derived from:
 * - XP (scaled down: xp ÷ 10)
 * - Achievements (weighted by tier)
 * - Streaks (bonus per 7-day milestone)
 * - Reputation events (direct delta from community actions)
 *
 * Trust levels gate community privileges:
 *   NEWCOMER    (0–99)     — default, can read + learn
 *   CONTRIBUTOR (100–499)  — can review tools/airdrops
 *   TRUSTED     (500–1999) — reviews auto-approved
 *   EXPERT      (2000–4999)— can moderate flagged content
 *   GUARDIAN    (5000+)     — full community moderation
 */

import { prisma } from "@/lib/prisma"
import type { Prisma, TrustLevel } from "@prisma/client"

// ─── Trust Level Thresholds ──────────────────────────────────────────────────

const TRUST_THRESHOLDS: { level: TrustLevel; min: number }[] = [
  { level: "GUARDIAN", min: 5000 },
  { level: "EXPERT", min: 2000 },
  { level: "TRUSTED", min: 500 },
  { level: "CONTRIBUTOR", min: 100 },
  { level: "NEWCOMER", min: 0 },
]

const TRUST_META: Record<TrustLevel, { label: string; icon: string; color: string }> = {
  NEWCOMER: { label: "Newcomer", icon: "🌱", color: "text-zinc-400" },
  CONTRIBUTOR: { label: "Contributor", icon: "⭐", color: "text-blue-400" },
  TRUSTED: { label: "Trusted", icon: "🛡️", color: "text-emerald-400" },
  EXPERT: { label: "Expert", icon: "🏆", color: "text-amber-400" },
  GUARDIAN: { label: "Guardian", icon: "💎", color: "text-purple-400" },
}

const ACHIEVEMENT_TIER_WEIGHT: Record<string, number> = {
  BRONZE: 50,
  SILVER: 100,
  GOLD: 200,
  PLATINUM: 500,
  DIAMOND: 1000,
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Determine trust level from a reputation score. */
export function trustLevelFromScore(score: number): TrustLevel {
  for (const { level, min } of TRUST_THRESHOLDS) {
    if (score >= min) return level
  }
  return "NEWCOMER"
}

/** Get display metadata for a trust level. */
export function getTrustMeta(level: TrustLevel) {
  return TRUST_META[level]
}

/** Get all trust levels with their thresholds (for UI progress). */
export function getTrustLevels() {
  return TRUST_THRESHOLDS.map((t) => ({ ...t, ...TRUST_META[t.level] }))
}

/**
 * Recalculate a user's reputation from all signals and update UserXP.
 * Call after any event that could change reputation (XP earned, achievement
 * unlocked, streak milestone, or explicit reputation event).
 */
export async function recalculateReputation(userId: string): Promise<{
  reputation: number
  trustLevel: TrustLevel
  changed: boolean
}> {
  const [userXp, achievements, events] = await Promise.all([
    prisma.userXP.findUnique({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: { select: { tier: true } } },
    }),
    prisma.reputationEvent.aggregate({
      where: { userId },
      _sum: { delta: true },
    }),
  ])

  // Base: XP contribution (scaled down)
  const xpContribution = Math.floor((userXp?.totalXp ?? 0) / 10)

  // Achievement contribution (weighted by tier)
  const achievementContribution = achievements.reduce(
    (sum, ua) => sum + (ACHIEVEMENT_TIER_WEIGHT[ua.achievement.tier] ?? 50),
    0,
  )

  // Streak contribution (bonus per completed 7-day cycle)
  const streak = await prisma.streak.findUnique({ where: { userId } })
  const streakContribution = Math.floor((streak?.longestStreak ?? 0) / 7) * 10

  // Direct reputation events (can be negative for penalties)
  const eventContribution = events._sum.delta ?? 0

  // Total reputation (floor at 0)
  const reputation = Math.max(0, xpContribution + achievementContribution + streakContribution + eventContribution)
  const trustLevel = trustLevelFromScore(reputation)

  // Update UserXP record
  const oldTrust = userXp?.trustLevel ?? "NEWCOMER"
  const oldRep = userXp?.reputation ?? 0
  const changed = reputation !== oldRep || trustLevel !== oldTrust

  if (changed && userXp) {
    await prisma.userXP.update({
      where: { userId },
      data: { reputation, trustLevel },
    })
  }

  return { reputation, trustLevel, changed }
}

/**
 * Record a reputation event and recalculate.
 * Use for community actions: helpful review (+10), spam report (-50), etc.
 */
export async function addReputationEvent(
  userId: string,
  delta: number,
  reason: string,
  metadata?: Record<string, unknown>,
): Promise<{ reputation: number; trustLevel: TrustLevel }> {
  await prisma.reputationEvent.create({
    data: { userId, delta, reason, metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined },
  })
  const result = await recalculateReputation(userId)
  return { reputation: result.reputation, trustLevel: result.trustLevel }
}

/**
 * Get a user's full reputation profile.
 */
export async function getReputationProfile(userId: string) {
  const userXp = await prisma.userXP.findUnique({ where: { userId } })
  const reputation = userXp?.reputation ?? 0
  const trustLevel = userXp?.trustLevel ?? ("NEWCOMER" as TrustLevel)
  const meta = getTrustMeta(trustLevel)
  const levels = getTrustLevels()
  const currentIdx = levels.findIndex((l) => l.level === trustLevel)
  const nextLevel = currentIdx > 0 ? levels[currentIdx - 1] : null

  return {
    reputation,
    trustLevel,
    ...meta,
    nextLevel: nextLevel
      ? { level: nextLevel.level, label: nextLevel.label, min: nextLevel.min, remaining: nextLevel.min - reputation }
      : null,
    xp: userXp?.totalXp ?? 0,
    level: userXp?.level ?? 1,
  }
}

/**
 * Get recent reputation events for a user (for profile history).
 */
export async function getReputationHistory(userId: string, limit = 20) {
  return prisma.reputationEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

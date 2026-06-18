/**
 * Gamification helpers: XP, streaks, achievements, referrals.
 */

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

// ─── XP Helpers ───────────────────────────────────────────────────────────────

/** Calculate level from XP using square-root formula */
export function xpToLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)))
}

/** Calculate XP needed for next level */
export function xpForNextLevel(currentXp: number): number {
  const currentLevel = xpToLevel(currentXp)
  return Math.pow(currentLevel + 1, 2) * 100
}

/** XP progress within current level (0–100%) */
export function xpProgress(xp: number): number {
  const level = xpToLevel(xp)
  const currentLevelXp = Math.pow(level, 2) * 100
  const nextLevelXp = Math.pow(level + 1, 2) * 100
  return Math.min(100, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
}

/** Add XP to a user, create UserXP record if not exists */
export async function addXp(
  userId: string,
  amount: number,
  reason: string,
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  const current = await prisma.userXP.findUnique({ where: { userId } })
  const oldLevel = current ? xpToLevel(current.totalXp) : 1

  const updated = await prisma.userXP.upsert({
    where: { userId },
    create: { userId, totalXp: amount, level: 1 },
    update: { totalXp: { increment: amount } },
  })

  const newLevel = xpToLevel(updated.totalXp)
  const leveledUp = newLevel > oldLevel

  // Log as audit event if amount > 0
  if (amount > 0) {
    await auditGamification(userId, "xp.earned", { amount, reason, newTotal: updated.totalXp, newLevel })
  }

  return { newXp: updated.totalXp, newLevel, leveledUp }
}

/** Get a user's XP record with user info */
export async function getUserXp(userId: string) {
  return prisma.userXP.findUnique({ where: { userId } })
}

// ─── Streak Helpers ───────────────────────────────────────────────────────────

/** Record daily activity and update streak */
export async function recordActivity(userId: string, xpEarned = 0): Promise<{
  currentStreak: number
  longestStreak: number
  isNewDay: boolean
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const existing = await prisma.streak.findUnique({ where: { userId } })

  if (existing) {
    const lastActive = new Date(existing.lastActiveDate)
    lastActive.setHours(0, 0, 0, 0)

    if (lastActive.getTime() === today.getTime()) {
      // Already active today, just increment actions/xp
      await prisma.dailyActivity.upsert({
        where: { userId_date: { userId, date: today } },
        create: { userId, date: today, xpEarned, actions: 1 },
        update: { xpEarned: { increment: xpEarned }, actions: { increment: 1 } },
      })
      return { currentStreak: existing.currentStreak, longestStreak: existing.longestStreak, isNewDay: false }
    }

    // New day — update streak
    const isConsecutive = lastActive.getTime() === yesterday.getTime()
    const newStreak = isConsecutive ? existing.currentStreak + 1 : 1
    const newLongest = Math.max(existing.longestStreak, newStreak)

    await prisma.streak.update({
      where: { userId },
      data: { currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: today },
    })

    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, xpEarned, actions: 1 },
      update: { xpEarned: { increment: xpEarned }, actions: { increment: 1 } },
    })

    return { currentStreak: newStreak, longestStreak: newLongest, isNewDay: true }
  } else {
    // First activity ever
    await prisma.streak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    })

    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, xpEarned, actions: 1 },
      update: {},
    })

    return { currentStreak: 1, longestStreak: 1, isNewDay: true }
  }
}

/** Get a user's current streak */
export async function getUserStreak(userId: string) {
  return prisma.streak.findUnique({ where: { userId } })
}

// ─── Achievement Helpers ───────────────────────────────────────────────────────

/** Check and award achievements after a trigger event */
export async function checkAchievements(userId: string, trigger: string): Promise<string[]> {
  const earned: string[] = []

  // Batch: fetch eligible achievements + already-earned IDs + trigger count in parallel
  const [eligible, alreadyEarned, triggerCount] = await Promise.all([
    prisma.achievement.findMany({ where: { active: true, trigger } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    countTriggerEvents(userId, trigger),
  ])

  const earnedSet = new Set(alreadyEarned.map((a) => a.achievementId))

  for (const achievement of eligible) {
    if (earnedSet.has(achievement.id)) continue

    if (triggerCount >= achievement.threshold) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          xpAwarded: achievement.xpReward,
        },
      })

      if (achievement.xpReward > 0) {
        await addXp(userId, achievement.xpReward, `Achievement: ${achievement.name}`)
      }

      await auditGamification(userId, "achievement.unlock", {
        achievement: achievement.slug,
        name: achievement.name,
        xpReward: achievement.xpReward,
      })

      earned.push(achievement.slug)
    }
  }

  return earned
}

/** Count trigger events for a user */
async function countTriggerEvents(userId: string, trigger: string): Promise<number> {
  switch (trigger) {
    case "post.publish":
      return prisma.post.count({ where: { authorId: userId, published: true } })
    case "learn.complete":
      return prisma.learnProgress.count({ where: { userId, completed: true } })
    case "streak.7":
      return (await prisma.streak.findUnique({ where: { userId } }))?.currentStreak ?? 0 >= 7 ? 1 : 0
    case "streak.30":
      return (await prisma.streak.findUnique({ where: { userId } }))?.currentStreak ?? 0 >= 30 ? 1 : 0
    case "xp.1000":
      return (await prisma.userXP.findUnique({ where: { userId } }))?.totalXp ?? 0 >= 1000 ? 1 : 0
    case "xp.10000":
      return (await prisma.userXP.findUnique({ where: { userId } }))?.totalXp ?? 0 >= 10000 ? 1 : 0
    case "referral.use":
      return prisma.referral.count({ where: { refereeId: userId, usedAt: { not: null } } })
    case "airdrop.complete":
      return prisma.userAirdropProgress.count({ where: { userId, tasksDone: { gt: 0 } } })
    default:
      return 0
  }
}

/** Get all achievements a user has earned */
export async function getUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { earnedAt: "desc" },
  })
}

/** Get all available achievements (for gallery) */
export async function getAllAchievements() {
  return prisma.achievement.findMany({
    where: { active: true },
    orderBy: [{ tier: "desc" }, { xpReward: "desc" }],
  })
}

// ─── Referral Helpers ─────────────────────────────────────────────────────────

/** Generate a unique referral code */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/** Create a referral link for a user */
export async function createReferralLink(userId: string): Promise<string> {
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year expiry

  const existing = await prisma.referral.findFirst({
    where: { referrerId: userId, usedAt: null, expiresAt: { gt: new Date() } },
  })
  if (existing) return existing.code

  const code = generateReferralCode()
  await prisma.referral.create({
    data: { referrerId: userId, code, expiresAt },
  })
  return code
}

/** Use a referral code (referee signs up) */
export async function applyReferralCode(code: string, refereeId: string): Promise<{
  success: boolean
  xpBonus: number
  error?: string
}> {
  const referral = await prisma.referral.findUnique({ where: { code } })

  if (!referral) return { success: false, xpBonus: 0, error: "Invalid referral code" }
  if (referral.usedAt) return { success: false, xpBonus: 0, error: "Referral code already used" }
  if (referral.refereeId) return { success: false, xpBonus: 0, error: "Referral already claimed" }
  if (referral.expiresAt < new Date()) return { success: false, xpBonus: 0, error: "Referral code expired" }
  if (referral.referrerId === refereeId) return { success: false, xpBonus: 0, error: "Cannot refer yourself" }

  const XP_BONUS = 50

  await prisma.referral.update({
    where: { id: referral.id },
    data: { refereeId, usedAt: new Date(), xpBonusAwarded: XP_BONUS },
  })

  // Award XP to both referrer and referee
  await addXp(referral.referrerId, XP_BONUS, "Referral bonus")
  await addXp(refereeId, XP_BONUS, "Referral sign-up bonus")

  // Check referral achievements
  await checkAchievements(referral.referrerId, "referral.use")
  await checkAchievements(refereeId, "referral.use")

  return { success: true, xpBonus: XP_BONUS }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

type LeaderboardEntry = {
  rank: number
  userId: string
  username: string | null
  name: string | null
  image: string | null
  totalXp: number
  level: number
  badge: string | null
}

const TIER_EMOJI: Record<string, string> = {
  DIAMOND: "💎",
  PLATINUM: "🏆",
  GOLD: "🥇",
  SILVER: "🥈",
  BRONZE: "🥉",
}

/** Get top users by XP for leaderboard */
export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const users = await prisma.userXP.findMany({
    orderBy: { totalXp: "desc" },
    take: limit,
    include: {
      user: {
        select: { username: true, name: true, image: true },
      },
    },
  })

  return users.map((u, i) => {
    const level = xpToLevel(u.totalXp)
    const badge = level >= 50 ? "💎" : level >= 30 ? "🏆" : level >= 20 ? "🥇" : level >= 10 ? "🥈" : null
    return {
      rank: i + 1,
      userId: u.userId,
      username: u.user.username,
      name: u.user.name,
      image: u.user.image,
      totalXp: u.totalXp,
      level,
      badge,
    }
  })
}

// ─── Audit ────────────────────────────────────────────────────────────────────

async function auditGamification(
  userId: string,
  action: string,
  details: Record<string, unknown>,
): Promise<void> {
  // Audit logging disabled — adminActivity model not available
  void userId
  void action
  void details
}
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { getUserAchievements, getAllAchievements } from "@/lib/gamification"

// GET /api/gamification/achievements
// Returns user's earned achievements and optionally all achievements (for gallery view)
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const includeAll = searchParams.get("include") === "all"

  try {
    const userAchievements = await getUserAchievements(session.user.id)

    if (includeAll) {
      const allAchievements = await getAllAchievements()

      // Mark which achievements are earned by the user
      const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId))
      const achievementsWithStatus = allAchievements.map((achievement) => ({
        ...achievement,
        earned: earnedIds.has(achievement.id),
        earnedAt: userAchievements.find((ua) => ua.achievementId === achievement.id)?.earnedAt ?? null,
      }))

      return NextResponse.json({
        userAchievements,
        achievements: achievementsWithStatus,
      })
    }

    return NextResponse.json({
      userAchievements,
    })
  } catch (error) {
    console.error("Achievements fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}
import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, CheckCircle2, Lock } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = generateSeo({
  title: "Achievements",
  description: "Kumpulkan achievement dan badge dengan berkontribusi di Web3AI Hub.",
  type: "website",
  canonical: "/achievements",
})

export const dynamic = "force-dynamic"

const tierInfo: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  BRONZE: {
    label: "Bronze",
    color: "text-amber-700",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  SILVER: {
    label: "Silver",
    color: "text-slate-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-700",
  },
  GOLD: {
    label: "Gold",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  PLATINUM: {
    label: "Platinum",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  DIAMOND: {
    label: "Diamond",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
}

const triggerLabels: Record<string, string> = {
  "post.publish": "Publish a post",
  "post.views": "Reach post views",
  "streak.7": "7-day streak",
  "streak.30": "30-day streak",
  "xp.100": "Earn 100 XP",
  "xp.1000": "Earn 1,000 XP",
  "xp.10000": "Earn 10,000 XP",
  "learn.complete": "Complete learning module",
  "referral.use": "Refer a friend",
  "airdrop.complete": "Complete airdrop tasks",
  "comment.post": "Post a comment",
  "tool.use": "Use AI tools",
}

export default async function AchievementsPage() {
  const session = await auth()

  const allAchievements = await prisma.achievement.findMany({
    where: { active: true },
    orderBy: [{ tier: "asc" }, { xpReward: "desc" }],
  })

  // Get user's earned achievements if logged in
  let userAchievements: Set<string> = new Set()
  if (session?.user?.id) {
    const earned = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: { achievementId: true },
    })
    userAchievements = new Set(earned.map((ua) => ua.achievementId))
  }

  // Group achievements by tier
  const achievementsByTier = allAchievements.reduce(
    (acc, achievement) => {
      const tier = achievement.tier
      if (!acc[tier]) acc[tier] = []
      acc[tier].push(achievement)
      return acc
    },
    {} as Record<string, typeof allAchievements>
  )

  const tierOrder = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]
  const sortedTiers = tierOrder.filter((tier) => achievementsByTier[tier]?.length > 0)

  const totalXpAvailable = allAchievements.reduce((sum, a) => sum + a.xpReward, 0)
  const earnedXp = allAchievements
    .filter((a) => userAchievements.has(a.id))
    .reduce((sum, a) => sum + a.xpReward, 0)

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-extrabold tracking-tight">Achievements</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Kumpulkan achievement dan badge dengan berkontribusi di Web3AI Hub.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="h-4 w-4 text-amber-500" />
              Total Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allAchievements.length}</p>
            <p className="text-xs text-muted-foreground">
              {sortedTiers.map((tier) => tierInfo[tier]?.label).join(" • ")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Star className="h-4 w-4 text-primary fill-primary" />
              XP Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalXpAvailable.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total reward XP</p>
          </CardContent>
        </Card>

        {session?.user ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userAchievements.size} / {allAchievements.length}</p>
              <p className="text-xs text-muted-foreground">
                {earnedXp.toLocaleString()} XP earned
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Login to Track
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sign in to track your achievement progress
              </p>
              <Link
                href="/admin/login"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                Login →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievements by Tier */}
      {sortedTiers.map((tier) => {
        const tierData = tierInfo[tier]
        const achievements = achievementsByTier[tier]

        return (
          <div key={tier} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tierData.bgColor} border ${tierData.borderColor}`}>
                <Trophy className={`h-5 w-5 ${tierData.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{tierData.label} Tier</h2>
                <p className="text-sm text-muted-foreground">
                  {achievements.length} achievements •{" "}
                  {achievements.reduce((sum, a) => sum + a.xpReward, 0)} XP total
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => {
                const isEarned = userAchievements.has(achievement.id)
                const triggerLabel = triggerLabels[achievement.trigger] ?? achievement.trigger

                return (
                  <Card
                    key={achievement.id}
                    className={`relative overflow-hidden transition-all ${
                      isEarned
                        ? "border-green-200 dark:border-green-800"
                        : "opacity-75"
                    }`}
                  >
                    {/* Earned indicator */}
                    {isEarned && (
                      <div className="absolute right-2 top-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    )}

                    {/* Tier accent */}
                    <div className={`absolute left-0 top-0 h-full w-1 ${tierData.borderColor.replace("border", "bg")}`} />

                    <CardHeader className="pb-2 pl-4">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{achievement.icon}</span>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base leading-tight">
                            {achievement.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`mt-1 text-xs ${tierData.color} ${tierData.bgColor}`}
                          >
                            {tierData.label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pl-4">
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {triggerLabel}
                        </span>
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <Star className="h-3 w-3 fill-primary" />
                          <span>+{achievement.xpReward} XP</span>
                        </div>
                      </div>

                      {isEarned && (
                        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                          ✓ Earned
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Empty State */}
      {allAchievements.length === 0 && (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Trophy className="mx-auto h-12 w-12 opacity-20" />
          <p className="mt-4">Belum ada achievement tersedia.</p>
          <p className="mt-1 text-sm"> Cek lagi nanti untuk update!</p>
        </div>
      )}

      {/* How to Earn */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">How to Earn Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Publish content:</strong> Write blog posts or articles to earn XP</p>
          <p>• <strong>Maintain streaks:</strong> Stay active daily to build your streak</p>
          <p>• <strong>Use AI tools:</strong> Try different AI tools on the platform</p>
          <p>• <strong>Complete airdrop tasks:</strong> Follow guides and complete tasks</p>
          <p>• <strong>Refer friends:</strong> Invite others to join using your referral code</p>
          <p>• <strong>Learn modules:</strong> Complete learning sections to unlock badges</p>
        </CardContent>
      </Card>
    </div>
  )
}
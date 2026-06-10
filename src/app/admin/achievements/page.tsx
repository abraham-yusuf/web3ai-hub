import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toggleAchievementActiveAction, createAchievementAction } from "./actions"

export const dynamic = "force-dynamic"

const TIER_ORDER = ["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE"] as const

const TIER_COLORS: Record<string, string> = {
  DIAMOND: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PLATINUM: "bg-slate-400/20 text-slate-300 border-slate-400/30",
  GOLD: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  SILVER: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  BRONZE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
}

const TRIGGER_LABELS: Record<string, string> = {
  "post.publish": "Published a blog post",
  "learn.complete": "Completed a lesson",
  "streak.7": "7-day streak",
  "streak.30": "30-day streak",
  "xp.1000": "Earned 1,000 XP",
  "xp.10000": "Earned 10,000 XP",
  "referral.use": "Successful referral",
  "airdrop.complete": "Completed airdrop tasks",
}

async function getAchievementCounts() {
  const achievements = await prisma.achievement.findMany({ select: { id: true } })
  const counts: Record<string, number> = {}
  
  for (const achievement of achievements) {
    counts[achievement.id] = await prisma.userAchievement.count({
      where: { achievementId: achievement.id },
    })
  }
  
  return counts
}

export default async function AdminAchievementsPage() {
  const [achievements, counts] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: [{ tier: "desc" }, { xpReward: "desc" }],
    }),
    getAchievementCounts(),
  ])

  const groupedAchievements = TIER_ORDER.reduce(
    (acc, tier) => {
      acc[tier] = achievements.filter((a) => a.tier === tier)
      return acc
    },
    {} as Record<string, typeof achievements>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Achievements Manager</h1>
          <p className="text-muted-foreground">Kelola achievement, XP rewards, dan trigger system.</p>
        </div>
      </div>

      {/* Create Achievement Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Achievement</CardTitle>
          <CardDescription>Tambahkan achievement baru untuk user.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAchievementAction} className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="slug" className="text-sm font-medium">Slug</label>
              <input
                id="slug"
                name="slug"
                type="text"
                placeholder="first-post"
                required
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="First Post"
                required
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="icon" className="text-sm font-medium">Icon (emoji)</label>
              <input
                id="icon"
                name="icon"
                type="text"
                placeholder="✍️"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="tier" className="text-sm font-medium">Tier</label>
              <select
                id="tier"
                name="tier"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="PLATINUM">Platinum</option>
                <option value="DIAMOND">Diamond</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="xpReward" className="text-sm font-medium">XP Reward</label>
              <input
                id="xpReward"
                name="xpReward"
                type="number"
                placeholder="10"
                defaultValue="10"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="trigger" className="text-sm font-medium">Trigger</label>
              <select
                id="trigger"
                name="trigger"
                required
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select trigger...</option>
                <option value="post.publish">post.publish</option>
                <option value="learn.complete">learn.complete</option>
                <option value="streak.7">streak.7</option>
                <option value="streak.30">streak.30</option>
                <option value="streak.100">streak.100</option>
                <option value="xp.1000">xp.1000</option>
                <option value="xp.10000">xp.10000</option>
                <option value="referral.use">referral.use</option>
                <option value="airdrop.complete">airdrop.complete</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="threshold" className="text-sm font-medium">Threshold</label>
              <input
                id="threshold"
                name="threshold"
                type="number"
                placeholder="1"
                defaultValue="1"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="Published your first blog post"
                required
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" size="lg">Create Achievement</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Achievements by Tier */}
      {TIER_ORDER.map((tier) => {
        const tierAchievements = groupedAchievements[tier]
        if (tierAchievements.length === 0) return null

        return (
          <div key={tier} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{tier}</h2>
              <Badge variant="outline" className={TIER_COLORS[tier]}>
                {tierAchievements.length} achievement{tierAchievements.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tierAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`relative ${!achievement.active ? "opacity-60" : ""}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className={TIER_COLORS[achievement.tier]}>
                        {achievement.tier}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {achievement.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">XP:</span>
                        <span className="font-medium text-yellow-500">{achievement.xpReward}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Users:</span>
                        <span className="font-medium">{counts[achievement.id] || 0}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Trigger:</span> {achievement.trigger}
                      {achievement.threshold > 1 && ` ×${achievement.threshold}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {TRIGGER_LABELS[achievement.trigger] || achievement.trigger}
                      {achievement.threshold > 1 && ` (${achievement.threshold} times)`}
                    </div>
                    <form action={toggleAchievementActiveAction} className="pt-2">
                      <input type="hidden" name="id" value={achievement.id} />
                      <input type="hidden" name="active" value={String(achievement.active)} />
                      <Button
                        type="submit"
                        variant={achievement.active ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                      >
                        {achievement.active ? "Disable" : "Enable"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {achievements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">No achievements yet</p>
            <p className="text-sm text-muted-foreground">Create your first achievement using the form above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
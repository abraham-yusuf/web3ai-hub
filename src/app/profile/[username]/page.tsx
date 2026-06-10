import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Flame, Star, Trophy, Calendar, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true, image: true, bio: true },
  })

  if (!user) return { title: "User Not Found" }

  return generateSeo({
    title: `${user.name ?? user.username} (@${user.username})`,
    description: user.bio ?? `Profil ${user.name ?? user.username} di Web3AI Hub.`,
    type: "profile",
    canonical: `/profile/${username}`,
  })
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      bio: true,
      twitter: true,
      github: true,
      linkedin: true,
      telegram: true,
      role: true,
      createdAt: true,
      xp: {
        select: {
          totalXp: true,
          level: true,
        },
      },
      streak: {
        select: {
          currentStreak: true,
          longestStreak: true,
        },
      },
      achievements: {
        select: {
          id: true,
          earnedAt: true,
          xpAwarded: true,
          achievement: {
            select: {
              slug: true,
              name: true,
              description: true,
              icon: true,
              tier: true,
              xpReward: true,
            },
          },
        },
        orderBy: {
          earnedAt: "desc",
        },
      },
      posts: {
        where: { published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          category: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          posts: { where: { published: true } },
          achievements: true,
        },
      },
    },
  })

  if (!user) notFound()

  const totalXp = user.xp?.totalXp ?? 0
  const level = user.xp?.level ?? 1
  const currentStreak = user.streak?.currentStreak ?? 0
  const longestStreak = user.streak?.longestStreak ?? 0

  // Calculate XP progress to next level
  const xpForCurrentLevel = (level - 1) * 1000
  const xpForNextLevel = level * 1000
  const xpProgress = totalXp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progressPercent = Math.min(100, Math.round((xpProgress / xpNeeded) * 100))

  const tierColors: Record<string, string> = {
    BRONZE: "bg-amber-700",
    SILVER: "bg-slate-400",
    GOLD: "bg-yellow-500",
    PLATINUM: "bg-emerald-500",
    DIAMOND: "bg-blue-400",
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      {/* Profile Header */}
      <div className="flex flex-col items-start gap-6 md:flex-row">
        <Avatar
          src={user.image}
          alt={user.name ?? user.username ?? ""}
          fallback={(user.name ?? user.username ?? "?").charAt(0)}
          className="h-24 w-24 border-4 border-primary/20"
          size="xl"
        />

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {user.name ?? user.username}
              </h1>
              {user.role !== "VIEWER" && (
                <Badge variant="secondary">{user.role}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="text-muted-foreground">{user.bio}</p>
          )}

          {/* Social Links */}
          <div className="flex flex-wrap gap-3">
            {user.twitter && (
              <a
                href={`https://twitter.com/${user.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                @{user.twitter}
              </a>
            )}
            {user.github && (
              <a
                href={`https://github.com/${user.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                {user.github}
              </a>
            )}
            {user.linkedin && (
              <a
                href={`https://linkedin.com/in/${user.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                {user.linkedin}
              </a>
            )}
            {user.telegram && (
              <a
                href={`https://t.me/${user.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                {user.telegram}
              </a>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Bergabung {user.createdAt.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* XP Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Star className="h-4 w-4 text-primary fill-primary" />
              Total XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalXp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Level {level}</p>
          </CardContent>
        </Card>

        {/* Level Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{xpProgress} / {xpNeeded} XP</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Flame className="h-4 w-4 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">
              Best: {longestStreak} days
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="h-4 w-4 text-amber-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user._count.achievements}</p>
            <p className="text-xs text-muted-foreground">Badges earned</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Achievements Section */}
      {user.achievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Achievements</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {user.achievements.map((ua) => (
              <Card key={ua.id} className="relative overflow-hidden">
                <div className={`absolute left-0 top-0 h-full w-1 ${tierColors[ua.achievement.tier] ?? "bg-muted"}`} />
                <CardHeader className="pb-2 pl-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{ua.achievement.icon}</span>
                    <Badge variant="outline" className="text-xs">
                      {ua.achievement.tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{ua.achievement.name}</CardTitle>
                </CardHeader>
                <CardContent className="pl-4">
                  <p className="text-sm text-muted-foreground">{ua.achievement.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Earned {ua.earnedAt.toLocaleDateString("id-ID")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {user.posts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Recent Posts</h2>
          <div className="space-y-3">
            {user.posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block rounded-lg border p-4 transition-colors hover:border-primary"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {post.publishedAt?.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {post.category}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {user.achievements.length === 0 && user.posts.length === 0 && (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p>Belum ada aktivitas publik dari pengguna ini.</p>
        </div>
      )}
    </div>
  )
}
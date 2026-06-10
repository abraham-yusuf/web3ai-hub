import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Flame, Star, Trophy } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = generateSeo({
  title: "Leaderboard",
  description: "Ranking pengguna terbaik berdasarkan XP dan kontribusi di Web3AI Hub.",
  type: "website",
  canonical: "/leaderboard",
})

export const dynamic = "force-dynamic"

interface LeaderboardEntry {
  id: string
  username: string | null
  name: string | null
  image: string | null
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  achievementCount: number
}

export default async function LeaderboardPage() {
  const topUsers = await prisma.user.findMany({
    where: {
      xp: { isNot: null },
    },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
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
        },
      },
    },
    orderBy: {
      xp: {
        totalXp: "desc",
      },
    },
    take: 50,
  })

  const leaderboard: LeaderboardEntry[] = topUsers.map((user, index) => ({
    id: user.id,
    username: user.username ?? `user-${index + 1}`,
    name: user.name,
    image: user.image ?? "",
    totalXp: user.xp?.totalXp ?? 0,
    level: user.xp?.level ?? 1,
    currentStreak: user.streak?.currentStreak ?? 0,
    longestStreak: user.streak?.longestStreak ?? 0,
    achievementCount: user.achievements.length,
  }))

  const top3 = leaderboard.slice(0, 3)

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-extrabold tracking-tight">Leaderboard</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Ranking pengguna terbaik berdasarkan XP dan kontribusi di Web3AI Hub.
        </p>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* 2nd place */}
          {top3[1] && (
            <Link href={`/profile/${top3[1].username}`}>
              <Card className="relative flex flex-col items-center py-6 text-center hover:border-primary/50">
                <div className="absolute -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <span className="text-sm font-bold">2</span>
                </div>
                <Avatar 
                  src={top3[1].image} 
                  alt={top3[1].name ?? top3[1].username ?? ""} 
                  fallback={(top3[1].name ?? top3[1].username ?? "?").charAt(0)} 
                  className="h-16 w-16 border-2 border-secondary" 
                  size="lg"
                />
                <div className="mt-3">
                  <p className="font-semibold">{top3[1].name ?? top3[1].username}</p>
                  <p className="text-xs text-muted-foreground">@{top3[1].username}</p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm font-medium text-secondary">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{top3[1].totalXp.toLocaleString()} XP</span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  Level {top3[1].level}
                </Badge>
              </Card>
            </Link>
          )}

          {/* 1st place */}
          {top3[0] && (
            <Link href={`/profile/${top3[0].username}`}>
              <Card className="relative flex flex-col items-center py-6 text-center ring-2 ring-primary/30 hover:border-primary">
                <div className="absolute -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <Avatar 
                  src={top3[0].image} 
                  alt={top3[0].name ?? top3[0].username ?? ""} 
                  fallback={(top3[0].name ?? top3[0].username ?? "?").charAt(0)} 
                  className="h-20 w-20 border-4 border-primary" 
                  size="xl"
                />
                <div className="mt-3">
                  <p className="font-bold text-lg">{top3[0].name ?? top3[0].username}</p>
                  <p className="text-xs text-muted-foreground">@{top3[0].username}</p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm font-bold text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{top3[0].totalXp.toLocaleString()} XP</span>
                </div>
                <Badge className="mt-2">Level {top3[0].level}</Badge>
              </Card>
            </Link>
          )}

          {/* 3rd place */}
          {top3[2] && (
            <Link href={`/profile/${top3[2].username}`}>
              <Card className="relative flex flex-col items-center py-6 text-center hover:border-primary/50">
                <div className="absolute -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-amber-50">
                  <span className="text-sm font-bold">3</span>
                </div>
                <Avatar 
                  src={top3[2].image} 
                  alt={top3[2].name ?? top3[2].username ?? ""} 
                  fallback={(top3[2].name ?? top3[2].username ?? "?").charAt(0)} 
                  className="h-16 w-16 border-2 border-amber-600" 
                  size="lg"
                />
                <div className="mt-3">
                  <p className="font-semibold">{top3[2].name ?? top3[2].username}</p>
                  <p className="text-xs text-muted-foreground">@{top3[2].username}</p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm font-medium text-amber-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{top3[2].totalXp.toLocaleString()} XP</span>
                </div>
                <Badge variant="outline" className="mt-2">
                  Level {top3[2].level}
                </Badge>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Full Ranking List */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight">Semua Peringkat</h2>
        <div className="rounded-xl border">
          {leaderboard.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 opacity-20" />
              <p className="mt-4">Belum ada data leaderboard.</p>
              <p className="mt-1 text-sm"> Jadilah yang pertama berkontribusi!</p>
            </div>
          ) : (
            leaderboard.map((user, index) => {
              const rank = index + 1
              const isTop3 = rank <= 3

              return (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50 ${
                    isTop3 ? "bg-primary/5" : ""
                  } ${index !== 0 ? "border-t" : ""}`}
                >
                  {/* Rank */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {rank <= 3 ? (
                      <Trophy className={`h-4 w-4 ${rank === 1 ? "text-primary" : rank === 2 ? "text-secondary" : "text-amber-600"}`} />
                    ) : (
                      rank
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar 
                    src={user.image} 
                    alt={user.name ?? user.username ?? ""} 
                    fallback={(user.name ?? user.username ?? "?").charAt(0)} 
                    className="h-10 w-10"
                    size="md"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.name ?? user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>

                  {/* Streak */}
                  {user.currentStreak > 0 && (
                    <div className="flex items-center gap-1 text-sm text-orange-500">
                      <Flame className="h-4 w-4" />
                      <span>{user.currentStreak}</span>
                    </div>
                  )}

                  {/* XP */}
                  <div className="flex items-center gap-1 font-medium">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                    <span>{user.totalXp.toLocaleString()}</span>
                  </div>

                  {/* Level Badge */}
                  <Badge variant="outline" className="shrink-0">
                    Lvl {user.level}
                  </Badge>

                  {/* Achievement Count */}
                  {user.achievementCount > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      {user.achievementCount} 🏆
                    </Badge>
                  )}
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
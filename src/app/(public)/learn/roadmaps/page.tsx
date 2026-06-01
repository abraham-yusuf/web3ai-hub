import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, BookOpen, Clock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Roadmaps",
  description: "Your personalized AI-generated learning roadmaps.",
}

export const dynamic = "force-dynamic"

export default async function RoadmapsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/admin/login")

  const roadmaps = await prisma.userRoadmap.findMany({
    where: { userId: session.user.id },
    include: {
      steps: {
        orderBy: { order: "asc" },
        select: { id: true, isCompleted: true },
      },
      _count: { select: { steps: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Roadmaps</h1>
          <p className="text-muted-foreground mt-1">
            {roadmaps.length === 0
              ? "No roadmaps yet. Generate your first one!"
              : `${roadmaps.length} roadmap${roadmaps.length !== 1 ? "s" : ""} created`}
          </p>
        </div>
        <Button className="gap-2">
          <Link href="/learn/generator" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            New Roadmap
          </Link>
        </Button>
      </div>

      {roadmaps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">No roadmaps yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Tell us your learning goal and we&apos;ll generate a personalized roadmap for you.
              </p>
            </div>
            <Button>
              <Link href="/learn/generator" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Generate My First Roadmap
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {roadmaps.map((r) => {
            const completed = r.steps.filter((s) => s.isCompleted).length
            const total = r._count.steps
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0
            const createdDate = new Date(r.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })

            return (
              <Link key={r.id} href={`/learn/roadmap/${r.id}`} className="group">
                <Card className="transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                            {r.title}
                          </h3>
                          <Badge variant="secondary" className="shrink-0">{r.level}</Badge>
                          {r.status === "active" && <Badge variant="outline" className="shrink-0">Active</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{r.goal}</p>

                        {/* Progress bar */}
                        <div className="space-y-1 max-w-sm">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{completed}/{total} steps completed</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {createdDate}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" /> {total} steps
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
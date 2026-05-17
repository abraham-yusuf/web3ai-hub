"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Award, BadgeCheck, BookOpenCheck, Flame, Trophy } from "lucide-react"
import type { LearnNavTrack } from "@/lib/learn"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PROGRESS_EVENT = "learn-progress-updated"

type LearnRetentionDashboardProps = {
  tracks: LearnNavTrack[]
  initialCompletedSlugs?: string[]
}

type FlatLesson = {
  slug: string
  title: string
  trackSlug: string
  trackTitle: string
}

function getStoredCompletion(slug: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback

  const stored = window.localStorage.getItem(`learn_progress_${slug}`)
  if (stored === "1") return true
  if (stored === "0") return false

  return fallback
}

export function LearnRetentionDashboard({ tracks, initialCompletedSlugs = [] }: LearnRetentionDashboardProps) {
  const lessons = useMemo<FlatLesson[]>(
    () =>
      tracks.flatMap((track) =>
        track.sections.flatMap((section) =>
          section.pages.map((page) => ({
            slug: page.slug,
            title: page.title,
            trackSlug: track.slug,
            trackTitle: track.title,
          })),
        ),
      ),
    [tracks],
  )

  const initialCompleted = useMemo(() => new Set(initialCompletedSlugs), [initialCompletedSlugs])
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(() => new Set(initialCompletedSlugs))

  useEffect(() => {
    function syncProgress() {
      const next = new Set<string>()
      lessons.forEach((lesson) => {
        if (getStoredCompletion(lesson.slug, initialCompleted.has(lesson.slug))) {
          next.add(lesson.slug)
        }
      })
      setCompletedSlugs(next)
    }

    syncProgress()
    window.addEventListener("storage", syncProgress)
    window.addEventListener(PROGRESS_EVENT, syncProgress)

    return () => {
      window.removeEventListener("storage", syncProgress)
      window.removeEventListener(PROGRESS_EVENT, syncProgress)
    }
  }, [initialCompleted, lessons])

  const totalLessons = lessons.length
  const completedCount = completedSlugs.size
  const completionRate = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const nextLesson = lessons.find((lesson) => !completedSlugs.has(lesson.slug)) ?? lessons[0]

  const trackStats = tracks.map((track) => {
    const trackLessons = lessons.filter((lesson) => lesson.trackSlug === track.slug)
    const trackCompleted = trackLessons.filter((lesson) => completedSlugs.has(lesson.slug)).length
    const trackRate = trackLessons.length > 0 ? Math.round((trackCompleted / trackLessons.length) * 100) : 0

    return {
      slug: track.slug,
      title: track.title,
      completed: trackCompleted,
      total: trackLessons.length,
      rate: trackRate,
      complete: trackLessons.length > 0 && trackCompleted === trackLessons.length,
    }
  })

  const unlockedBadges = [
    {
      id: "first-step",
      title: "First Step",
      description: "Menyelesaikan lesson pertama.",
      unlocked: completedCount >= 1,
      icon: BadgeCheck,
    },
    {
      id: "consistent-learner",
      title: "Consistent Learner",
      description: "Menyelesaikan minimal 3 lesson.",
      unlocked: completedCount >= 3,
      icon: Flame,
    },
    {
      id: "track-finisher",
      title: "Track Finisher",
      description: "Menuntaskan satu learning track.",
      unlocked: trackStats.some((track) => track.complete),
      icon: Award,
    },
    {
      id: "academy-complete",
      title: "Academy Complete",
      description: "Semua lesson sudah selesai.",
      unlocked: totalLessons > 0 && completedCount === totalLessons,
      icon: Trophy,
    },
  ]

  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/[0.03]">
      <CardHeader className="gap-4 grid-cols-1 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <BookOpenCheck className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            Dashboard Progress Belajar
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Pantau progres, lanjutkan lesson berikutnya, dan kumpulkan badge penyelesaian.
          </CardDescription>
        </div>
        {nextLesson ? (
          <Link
            href={`/learn/${nextLesson.slug}`}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto sm:justify-self-end"
          >
            {completedCount === totalLessons ? "Ulangi Materi" : "Lanjutkan"}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Completion</p>
                <p className="text-2xl font-bold sm:text-3xl">{completionRate}%</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{totalLessons} lesson selesai
              </p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">Badge Unlocked</p>
            <p className="text-2xl font-bold sm:text-3xl">
              {unlockedBadges.filter((badge) => badge.unlocked).length}/{unlockedBadges.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Badge tampil otomatis saat lesson ditandai completed.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {trackStats.map((track) => (
            <div key={track.slug} className="rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{track.title}</p>
                  <p className="text-xs text-muted-foreground">{track.completed}/{track.total} lesson selesai</p>
                </div>
                {track.complete ? <Badge className="bg-green-600 text-white hover:bg-green-600">Completed</Badge> : <Badge variant="outline">{track.rate}%</Badge>}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${track.rate}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {unlockedBadges.map((badge) => {
            const Icon = badge.icon

            return (
              <div
                key={badge.id}
                className={`rounded-xl border p-4 transition-colors ${
                  badge.unlocked ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100" : "bg-background text-muted-foreground"
                }`}
              >
                <Icon className={`h-6 w-6 ${badge.unlocked ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground"}`} />
                <p className="mt-3 font-semibold">{badge.title}</p>
                <p className="mt-1 text-xs">{badge.description}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

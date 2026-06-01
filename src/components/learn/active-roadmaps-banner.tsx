"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { BookMarked, ChevronRight, Sparkles } from "lucide-react"

type RoadmapSummary = {
  id: string
  title: string
  goal: string
  level: string
  totalSteps: number
  completedSteps: number
}

type ActiveRoadmapsBannerProps = {
  initialRoadmaps?: RoadmapSummary[]
}

export function ActiveRoadmapsBanner({ initialRoadmaps }: ActiveRoadmapsBannerProps) {
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>(initialRoadmaps ?? [])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!initialRoadmaps || initialRoadmaps.length === 0) {
      fetch("/api/learn/roadmap")
        .then((r) => r.json())
        .then((data) => setRoadmaps(data.roadmaps?.slice(0, 2) ?? []))
        .catch(() => {})
    }
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [initialRoadmaps])

  if (roadmaps.length === 0) return null

  const r = roadmaps[0]
  const pct = r.totalSteps > 0 ? Math.round((r.completedSteps / r.totalSteps) * 100) : 0

  return (
    <div
      className={`rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 space-y-3 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 shrink-0">
            <BookMarked className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active Roadmap</p>
            <p className="font-semibold leading-tight">{r.title}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-primary shrink-0">
          <Link href="/learn/roadmaps" className="flex items-center gap-1">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{r.completedSteps}/{r.totalSteps} steps completed</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-primary/20 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm">
          <Link href={`/learn/roadmap/${r.id}`} className="flex items-center gap-1">
            Continue <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="sm">
          <Link href="/learn/generator" className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> New Roadmap
          </Link>
        </Button>
      </div>
    </div>
  )
}
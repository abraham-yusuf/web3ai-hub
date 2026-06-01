"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Clock, ExternalLink, Loader2, Sparkles, Target, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface RoadmapStep {
  id: string
  title: string
  description: string
  order: number
  type: string
  pageSlug: string | null
  estimatedTime: string | null
  milestone: string | null
  isCompleted: boolean
}

interface RoadmapData {
  id: string
  title: string
  goal: string
  level: string
  status: string
  createdAt: string
  steps: RoadmapStep[]
}

export default function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({})

  async function fetchRoadmap() {
    try {
      const res = await fetch(`/api/learn/roadmap/${id}`)
      if (!res.ok) {
        if (res.status === 404) { router.push("/learn/roadmaps"); return }
        throw new Error("Failed to load roadmap")
      }
      const data = await res.json()
      setRoadmap(data.roadmap)
    } catch {
      setFetchError(true)
      toast.error("Failed to load roadmap")
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional async data fetch
    fetchRoadmap()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function toggleStep(stepId: string) {
    setTogglingId(stepId)
    try {
      const res = await fetch(`/api/learn/roadmap/steps/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRoadmap((prev) =>
        prev
          ? {
              ...prev,
              steps: prev.steps.map((s) =>
                s.id === stepId ? { ...s, isCompleted: data.step.isCompleted } : s
              ),
            }
          : prev
      )
    } catch {
      toast.error("Failed to update step")
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this roadmap? This cannot be undone.")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/learn/roadmap/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Roadmap deleted")
      router.push("/learn/roadmaps")
    } catch {
      toast.error("Failed to delete roadmap")
      setDeleting(false)
    }
  }

  if (roadmap === null && !fetchError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Roadmap not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/learn/roadmaps")}>
          Back to Roadmaps
        </Button>
      </div>
    )
  }

  const orderedSteps = [...roadmap.steps].sort((a, b) => a.order - b.order)
  const completedCount = orderedSteps.filter((s) => s.isCompleted).length
  const progress = orderedSteps.length > 0 ? Math.round((completedCount / orderedSteps.length) * 100) : 0
  const isComplete = completedCount === orderedSteps.length

  // Find next incomplete step
  const nextStep = orderedSteps.find((s) => !s.isCompleted)

  // Group steps by milestone
  const milestoneGroups: { milestone: string | null; steps: RoadmapStep[] }[] = []
  orderedSteps.forEach((step) => {
    const last = milestoneGroups[milestoneGroups.length - 1]
    if (last && last.milestone === step.milestone) {
      last.steps.push(step)
    } else {
      milestoneGroups.push({ milestone: step.milestone, steps: [step] })
    }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2" onClick={() => router.push("/learn/roadmaps")}>
            <ArrowLeft className="h-4 w-4" /> My Roadmaps
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{roadmap.title}</h1>
          <p className="text-muted-foreground">{roadmap.goal}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} of {orderedSteps.length} steps completed
          </span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-3">
          <Badge variant="secondary">{roadmap.level}</Badge>
          {isComplete && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Completed!
            </Badge>
          )}
        </div>
      </div>

      {/* Next Step Banner */}
      {nextStep && !isComplete && (
        <button
          onClick={() => {
            const el = stepRefs.current[nextStep.id]
            el?.scrollIntoView({ behavior: "smooth", block: "center" })
            el?.classList.add("ring-2", "ring-primary", "ring-offset-2")
            setTimeout(() => el?.classList.remove("ring-2", "ring-primary", "ring-offset-2"), 2000)
          }}
          className="w-full flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 px-5 py-4 text-left hover:bg-primary/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Up Next</p>
              <p className="font-semibold group-hover:text-primary transition-colors">{nextStep.title}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>
      )}

      {/* Completion celebration */}
      {isComplete && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">Roadmap Completed!</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Great job! You&apos;ve finished all {orderedSteps.length} steps.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto shrink-0 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300"
            onClick={() => router.push("/learn/generator")}
          >
            <Sparkles className="h-4 w-4 mr-1" /> New Roadmap
          </Button>
        </div>
      )}

      {/* Steps by Milestone Group */}
      <div className="space-y-6">
        {milestoneGroups.map((group, gi) => {
          const groupCompleted = group.steps.filter((s) => s.isCompleted).length
          const groupTotal = group.steps.length

          return (
            <div key={gi} className="space-y-3">
              {/* Milestone header */}
              {group.milestone && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {group.milestone}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">
                    {groupCompleted}/{groupTotal}
                  </span>
                </div>
              )}

              {/* Steps in this group */}
              <div className="space-y-3">
                {group.steps.map((step) => {
                  const globalIndex = orderedSteps.findIndex((s) => s.id === step.id)
                  const isNext = step.id === nextStep?.id

                  return (
                    <Card
                      key={step.id}
                      ref={(el) => { stepRefs.current[step.id] = el }}
                      className={`transition-all duration-300 ${
                        step.isCompleted
                          ? "opacity-60"
                          : isNext
                          ? "border-primary/40 shadow-md shadow-primary/10"
                          : ""
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          {/* Toggle button */}
                          <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                            <button
                              onClick={() => toggleStep(step.id)}
                              disabled={togglingId === step.id}
                              className={`rounded-full border-2 w-9 h-9 flex items-center justify-center transition-all ${
                                step.isCompleted
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 hover:border-primary bg-background"
                              }`}
                            >
                              {togglingId === step.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : step.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <span className="text-xs font-bold">{globalIndex + 1}</span>
                              )}
                            </button>
                            {/* Connector line */}
                            {gi < milestoneGroups.length - 1 && (
                              <div className="w-px flex-1 bg-border min-h-4" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`font-semibold ${
                                  step.isCompleted ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {step.title}
                              </h3>
                              <Badge variant="outline" className="text-xs capitalize shrink-0">
                                {step.type}
                              </Badge>
                              {step.estimatedTime && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                  <Clock className="h-3 w-3" />
                                  {step.estimatedTime}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                            {step.pageSlug && (
                              <Link
                                href={`/learn/${step.pageSlug}`}
                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                Open related content
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
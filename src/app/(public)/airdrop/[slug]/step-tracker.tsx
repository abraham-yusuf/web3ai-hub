"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"

interface Step {
  title: string
  description?: string
  isOptional?: boolean
}

interface StepTrackerProps {
  airdropSlug: string
  steps: Step[]
}

function getStoredProgress(airdropSlug: string): number[] {
  if (typeof window === "undefined") {
    return []
  }

  const saved = localStorage.getItem(`airdrop-progress-${airdropSlug}`)
  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed.filter((value): value is number => typeof value === "number") : []
  } catch {
    return []
  }
}

export function StepTracker({ airdropSlug, steps }: StepTrackerProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => getStoredProgress(airdropSlug))

  const progress = useMemo(() => {
    if (steps.length === 0) {
      return 0
    }

    return Math.round((completedSteps.length / steps.length) * 100)
  }, [completedSteps.length, steps.length])

  const toggleStep = (index: number) => {
    const nextSteps = completedSteps.includes(index)
      ? completedSteps.filter((item) => item !== index)
      : [...completedSteps, index]

    setCompletedSteps(nextSteps)
    localStorage.setItem(`airdrop-progress-${airdropSlug}`, JSON.stringify(nextSteps))
  }

  const resetProgress = () => {
    setCompletedSteps([])
    localStorage.removeItem(`airdrop-progress-${airdropSlug}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">{progress}%</span>
          <button type="button" onClick={resetProgress} className="text-xs text-muted-foreground hover:text-primary">Reset</button>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const checked = completedSteps.includes(index)

          return (
            <div
              key={`${step.title}-${index}`}
              className={cn(
                "flex gap-4 rounded-xl border p-4 transition-colors",
                checked ? "border-primary/20 bg-muted/50" : "hover:border-primary/20",
              )}
            >
              <div className="pt-1">
                <Checkbox checked={checked} onCheckedChange={() => toggleStep(index)} className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-bold",
                      checked && "text-muted-foreground line-through decoration-2",
                    )}
                  >
                    {step.title}
                  </span>
                  {step.isOptional && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Optional
                    </span>
                  )}
                </div>
                {step.description && <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

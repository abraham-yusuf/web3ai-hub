"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  description?: string
  isOptional?: boolean
}

interface StepTrackerProps {
  airdropSlug: string
  steps: Step[]
}

export function StepTracker({ airdropSlug, steps }: StepTrackerProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`airdrop-progress-${airdropSlug}`)
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse airdrop progress", e)
      }
    }
    setIsLoaded(true)
  }, [airdropSlug])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`airdrop-progress-${airdropSlug}`, JSON.stringify(completedSteps))
    }
  }, [completedSteps, airdropSlug, isLoaded])

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  const progress = steps.length > 0 
    ? Math.round((completedSteps.length / steps.length) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        <span className="text-sm font-bold text-primary">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={cn(
              "flex gap-4 p-4 rounded-xl border transition-colors cursor-pointer",
              completedSteps.includes(index) ? "bg-muted/50 border-primary/20" : "hover:border-primary/20"
            )}
            onClick={() => toggleStep(index)}
          >
            <div className="pt-1">
              <Checkbox 
                checked={completedSteps.includes(index)} 
                onCheckedChange={() => toggleStep(index)}
                className="h-5 w-5"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-bold",
                  completedSteps.includes(index) && "text-muted-foreground line-through decoration-2"
                )}>
                  {step.title}
                </span>
                {step.isOptional && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">
                    Optional
                  </span>
                )}
              </div>
              {step.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

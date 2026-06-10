"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Airdrop {
  id: string
  name: string
  slug: string
  logo?: string | null
  network: string
  status: string
  estimatedReward?: string | null
  difficulty: string
  deadline: Date | string | null
}

interface CalendarViewProps {
  airdrops: Airdrop[]
  groupedByMonth: Record<string, Airdrop[]>
}

const statusColors = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  UPCOMING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  ENDED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const deadlineColors = {
  safe: "border-l-green-500",
  warning: "border-l-yellow-500",
  danger: "border-l-red-500",
  ended: "border-l-gray-400",
}

function getDeadlineColor(deadline: Date | string | null, status: string): string {
  if (status === "ENDED") return deadlineColors.ended
  if (!deadline) return deadlineColors.safe
  
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return deadlineColors.ended
  if (daysLeft < 7) return deadlineColors.danger
  if (daysLeft < 30) return deadlineColors.warning
  return deadlineColors.safe
}

function getDaysRemaining(deadline: Date | string | null): string {
  if (!deadline) return "No deadline"
  
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return "Ended"
  if (daysLeft === 0) return "Today!"
  if (daysLeft === 1) return "1 day left"
  return `${daysLeft} days left`
}

function getDeadlineBadgeVariant(deadline: Date | string | null, status: string): "default" | "secondary" | "destructive" {
  if (status === "ENDED") return "secondary"
  if (!deadline) return "default"
  
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return "secondary"
  if (daysLeft < 7) return "destructive"
  return "default"
}

function formatDeadline(deadline: Date | string | null): string {
  if (!deadline) return "No deadline set"
  
  const date = new Date(deadline)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function CalendarView({ airdrops, groupedByMonth }: CalendarViewProps) {
  const monthOrder = Object.keys(groupedByMonth).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="space-y-8">
      {monthOrder.map((month) => (
        <div key={month} className="space-y-4">
          <h2 className="text-xl font-semibold sticky top-16 z-10 bg-background py-2">
            {month}
          </h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-3">
              {groupedByMonth[month].map((airdrop) => {
                const deadlineColor = getDeadlineColor(airdrop.deadline, airdrop.status)
                const daysRemaining = getDaysRemaining(airdrop.deadline)
                const badgeVariant = getDeadlineBadgeVariant(airdrop.deadline, airdrop.status)
                const formattedDeadline = formatDeadline(airdrop.deadline)
                
                return (
                  <Link
                    key={airdrop.id}
                    href={`/airdrop/${airdrop.slug}`}
                    className={cn(
                      "relative flex gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50",
                      "border-l-4",
                      deadlineColor
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                    
                    {/* Logo placeholder */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-bold">
                      {airdrop.logo ? (
                        <img
                          src={airdrop.logo}
                          alt={airdrop.name}
                          className="h-full w-full object-contain rounded-lg"
                        />
                      ) : (
                        airdrop.name[0]
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{airdrop.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {airdrop.network}
                            </Badge>
                            <Badge
                              variant={badgeVariant}
                              className={cn("text-xs", statusColors[airdrop.status as keyof typeof statusColors])}
                            >
                              {airdrop.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "text-sm font-medium",
                            badgeVariant === "destructive" && "text-red-500",
                            badgeVariant === "default" && "text-green-600",
                            badgeVariant === "secondary" && "text-muted-foreground"
                          )}>
                            {daysRemaining}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formattedDeadline}
                          </p>
                        </div>
                      </div>
                      
                      {/* Estimated reward */}
                      {airdrop.estimatedReward && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Est. Reward: <span className="text-primary font-medium">{airdrop.estimatedReward}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
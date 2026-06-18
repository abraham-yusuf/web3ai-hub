import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import nextDynamic from "next/dynamic"

const CalendarView = nextDynamic(
  () => import("@/components/airdrop/calendar-view").then((m) => ({ default: m.CalendarView })),
  { loading: () => <div className="animate-pulse h-64 rounded-lg bg-muted/50" /> },
)
import { Bell, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface SearchParams {
  network?: string
  filter?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date()
  const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  
  const upcomingCount = await prisma.airdrop.count({
    where: {
      deadline: {
        gte: now,
        lte: futureDate,
      },
    },
  })

  return {
    title: "Airdrop Calendar — AI3",
    description: `Track upcoming crypto airdrops with deadlines. ${upcomingCount} airdrops with upcoming deadlines in the next 90 days.`,
    keywords: ["airdrop calendar", "crypto airdrops", "airdrop deadlines", "airdrop tracker"],
  }
}

export default async function AirdropCalendarPage({ searchParams }: PageProps) {
  const params = await searchParams
  const networkFilter = params.network || "all"
  const timeFilter = params.filter || "all"

  const now = new Date()
  const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

  // Build where clause
  const where: any = {
    deadline: {
      gte: now,
      lte: futureDate,
    },
  }

  if (networkFilter !== "all") {
    where.network = networkFilter
  }

  // Get all unique networks for filter
  const networks = await prisma.airdrop.findMany({
    where: { network: { not: "" } },
    select: { network: true },
    distinct: ["network"],
  })

  // Fetch airdrops with deadlines
  const airdrops = await prisma.airdrop.findMany({
    where,
    orderBy: { deadline: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      network: true,
      status: true,
      estimatedReward: true,
      difficulty: true,
      deadline: true,
    },
  })

  // Group by month
  const groupedByMonth: Record<string, typeof airdrops> = {}
  
  for (const airdrop of airdrops) {
    if (!airdrop.deadline) continue
    
    const date = new Date(airdrop.deadline)
    const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    
    if (!groupedByMonth[monthLabel]) {
      groupedByMonth[monthLabel] = []
    }
    groupedByMonth[monthLabel].push(airdrop)
  }

  // Calculate stats
  const thisWeek = airdrops.filter((a) => {
    if (!a.deadline) return false
    const daysLeft = Math.ceil((a.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 7 && daysLeft >= 0
  }).length

  const thisMonth = airdrops.filter((a) => {
    if (!a.deadline) return false
    const daysLeft = Math.ceil((a.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 30 && daysLeft >= 0
  }).length

  // JSON-LD Event structured data
  const jsonLdEvents = airdrops
    .filter((a) => a.deadline)
    .map((airdrop) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: `${airdrop.name} Airdrop Deadline`,
      description: `Deadline to claim ${airdrop.name} airdrop on ${airdrop.network}`,
      startDate: airdrop.deadline?.toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: `/airdrop/${airdrop.slug}`,
      },
    }))

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvents) }}
      />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Airdrop Calendar</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Track upcoming airdrop deadlines and never miss an opportunity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{airdrops.length}</p>
              <p className="text-sm text-muted-foreground">Total Upcoming</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-3">
              <Clock className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{thisWeek}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{thisMonth}</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border bg-card p-1">
          <Link
            href={`/airdrop/calendar?network=${networkFilter}&filter=all`}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeFilter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            All
          </Link>
          <Link
            href={`/airdrop/calendar?network=${networkFilter}&filter=week`}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeFilter === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            This Week
          </Link>
          <Link
            href={`/airdrop/calendar?network=${networkFilter}&filter=month`}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeFilter === "month" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            This Month
          </Link>
        </div>

        <div className="relative">
          <select
            value={networkFilter}
            onChange={(e) => {
              window.location.href = `/airdrop/calendar?network=${e.target.value}&filter=${timeFilter}`
            }}
            className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none pr-10 cursor-pointer"
          >
            <option value="all">All Networks</option>
            {networks.map((n) => (
              <option key={n.network} value={n.network}>
                {n.network}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Calendar Timeline */}
      <CalendarView airdrops={airdrops} groupedByMonth={groupedByMonth} />

      {/* Empty State */}
      {airdrops.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No upcoming deadlines</h3>
          <p className="text-muted-foreground">
            No airdrops with deadlines found. Check back later or adjust your filters.
          </p>
        </div>
      )}
    </div>
  )
}
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch upcoming airdrops with deadlines
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "90", 10)
    const network = searchParams.get("network")
    const status = searchParams.get("status")

    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    const where: any = {
      deadline: {
        gte: now,
        lte: futureDate,
      },
    }

    if (network) {
      where.network = network
    }

    if (status) {
      where.status = status
    }

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
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      
      if (!groupedByMonth[monthLabel]) {
        groupedByMonth[monthLabel] = []
      }
      groupedByMonth[monthLabel].push(airdrop)
    }

    return NextResponse.json({
      airdrops,
      groupedByMonth,
      total: airdrops.length,
    })
  } catch (error) {
    console.error("Upcoming airdrops fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch upcoming airdrops" }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const userXp = await prisma.userXP.findUnique({
      where: { userId },
    })

    if (!userXp) {
      return NextResponse.json({ totalXp: 0, level: 1, breakdown: [] })
    }

    // Get XP breakdown by airdrop
    const progress = await prisma.userAirdropProgress.findMany({
      where: { userId },
      orderBy: { xpEarned: "desc" },
    })

    return NextResponse.json({
      totalXp: userXp.totalXp,
      level: userXp.level,
      breakdown: progress.map((p: { airdropId: string; xpEarned: number; tasksDone: number }) => ({
        airdropId: p.airdropId,
        xpEarned: p.xpEarned,
        tasksDone: p.tasksDone,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
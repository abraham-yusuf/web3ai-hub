import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    const result = roadmaps.map((r) => ({
      id: r.id,
      title: r.title,
      goal: r.goal,
      level: r.level,
      status: r.status,
      createdAt: r.createdAt,
      totalSteps: r._count.steps,
      completedSteps: r.steps.filter((s) => s.isCompleted).length,
    }))

    return NextResponse.json({ roadmaps: result })
  } catch (error) {
    console.error("[LIST_ROADMAPS_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
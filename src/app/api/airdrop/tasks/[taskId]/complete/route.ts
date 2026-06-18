import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function calculateLevel(xp: number): number {
  // Level formula: each level requires 100 * level XP
  // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
  let level = 1
  let requiredXp = 0
  while (requiredXp + level * 100 <= xp) {
    requiredXp += level * 100
    level++
  }
  return level
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const task = await prisma.airdropTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if already completed by this user
    const existing = await prisma.airdropTask.findFirst({
      where: { id: taskId, userId },
    })

    if (existing?.isCompleted) {
      return NextResponse.json({ error: "Task already completed" }, { status: 409 })
    }

    // Mark task as completed for this user
    // Upsert: create with isCompleted=true if not exists, or update existing
    await prisma.airdropTask.upsert({
      where: { id: taskId },
      create: {
        id: taskId,
        airdropId: task.airdropId,
        title: task.title,
        description: task.description,
        type: task.type,
        xpReward: task.xpReward,
        userId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        userId,
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    // Update UserXP
    const userXp = await prisma.userXP.upsert({
      where: { userId },
      create: { userId, totalXp: task.xpReward, level: 1 },
      update: {
        totalXp: { increment: task.xpReward },
      },
    })

    // Recalculate level
    const newLevel = calculateLevel(userXp.totalXp)
    await prisma.userXP.update({
      where: { userId },
      data: { level: newLevel },
    })

    // Update progress + create notification in parallel (independent writes)
    await Promise.all([
      prisma.userAirdropProgress.upsert({
        where: { userId_airdropId: { userId, airdropId: task.airdropId } },
        create: {
          userId,
          airdropId: task.airdropId,
          xpEarned: task.xpReward,
          tasksDone: 1,
        },
        update: {
          xpEarned: { increment: task.xpReward },
          tasksDone: { increment: 1 },
          lastActive: new Date(),
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          airdropId: task.airdropId,
          title: "+XP Earned!",
          message: `You earned ${task.xpReward} XP for completing "${task.title}"`,
          type: "xp_earned",
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      xpEarned: task.xpReward,
      totalXp: userXp.totalXp + task.xpReward,
      level: newLevel,
    })
  } catch (error) {
    console.error("Complete task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { discordWebhook, subscribeToAirdrops, subscribeToPosts, subscribeToUpdates } = body

    const subscriptions: string[] = []
    if (subscribeToAirdrops) subscriptions.push("airdrop")
    if (subscribeToPosts) subscriptions.push("post")
    if (subscribeToUpdates) subscriptions.push("update")

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, telegram: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await prisma.notificationSubscription.upsert({
      where: {
        userId_airdropId_type: {
          userId: session.user.id,
          airdropId: "default",
          type: "discord",
        },
      },
      update: {
        isActive: true,
      },
      create: {
        userId: session.user.id,
        airdropId: "default",
        type: "discord",
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Discord notifications enabled",
      subscriptions,
    })
  } catch (error) {
    console.error("[notifications/discord] Error:", error)
    return NextResponse.json({ error: "Failed to save Discord subscription" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.notificationSubscription.deleteMany({
      where: {
        userId: session.user.id,
        type: "discord",
        airdropId: "default",
      },
    })

    return NextResponse.json({ success: true, message: "Discord notifications disabled" })
  } catch (error) {
    console.error("[notifications/discord] Error:", error)
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const subscriptions = await prisma.notificationSubscription.findMany({
      where: {
        userId: session.user.id,
        type: "discord",
      },
    })

    return NextResponse.json({
      enabled: subscriptions.some((s) => s.isActive),
      subscriptions: subscriptions.map((s) => s.type),
    })
  } catch (error) {
    console.error("[notifications/discord] Error:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}
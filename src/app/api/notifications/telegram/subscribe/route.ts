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
    const { telegramChatId, subscribeToAirdrops, subscribeToPosts, subscribeToUpdates } = body

    if (!telegramChatId) {
      return NextResponse.json({ error: "telegramChatId is required" }, { status: 400 })
    }

    await prisma.notificationSubscription.upsert({
      where: {
        userId_airdropId_type: {
          userId: session.user.id,
          airdropId: "default",
          type: "telegram",
        },
      },
      update: {
        telegram: String(telegramChatId),
        isActive: true,
      },
      create: {
        userId: session.user.id,
        airdropId: "default",
        type: "telegram",
        telegram: String(telegramChatId),
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Telegram notifications enabled",
      telegramChatId,
    })
  } catch (error) {
    console.error("[notifications/telegram/subscribe] Error:", error)
    return NextResponse.json({ error: "Failed to save Telegram subscription" }, { status: 500 })
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
        type: "telegram",
        airdropId: "default",
      },
    })

    return NextResponse.json({ success: true, message: "Telegram notifications disabled" })
  } catch (error) {
    console.error("[notifications/telegram/subscribe] Error:", error)
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const subscription = await prisma.notificationSubscription.findFirst({
      where: {
        userId: session.user.id,
        type: "telegram",
        airdropId: "default",
      },
    })

    return NextResponse.json({
      enabled: subscription?.isActive ?? false,
      telegramChatId: subscription?.telegram ?? null,
    })
  } catch (error) {
    console.error("[notifications/telegram/subscribe] Error:", error)
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
  }
}
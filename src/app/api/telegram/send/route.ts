import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  sendTelegramAirdropAlert,
  sendTelegramNewPost,
  sendTelegramUserNotification,
  sendTelegramAirdropDeadlineReminder,
} from "@/lib/telegram"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { type, data } = body

    let success = false

    switch (type) {
      case "airdrop":
        success = await sendTelegramAirdropAlert({
          airdropName: data.airdropName,
          network: data.network,
          deadline: data.deadline,
          url: data.url,
          difficulty: data.difficulty,
          estimatedReward: data.estimatedReward,
        })
        break

      case "post":
        success = await sendTelegramNewPost({
          title: data.title,
          excerpt: data.excerpt,
          url: data.url,
          category: data.category,
          authorName: data.authorName,
        })
        break

      case "user_notification":
        success = await sendTelegramUserNotification({
          telegramChatId: data.telegramChatId,
          title: data.title,
          message: data.message,
          url: data.url,
        })
        break

      case "deadline_reminder":
        success = await sendTelegramAirdropDeadlineReminder({
          airdropName: data.airdropName,
          network: data.network,
          hoursRemaining: data.hoursRemaining,
          url: data.url,
        })
        break

      default:
        return NextResponse.json({ error: "Unknown notification type" }, { status: 400 })
    }

    return NextResponse.json({ success })
  } catch (error) {
    console.error("[telegram/send] Error:", error)
    return NextResponse.json({ error: "Failed to send Telegram notification" }, { status: 500 })
  }
}
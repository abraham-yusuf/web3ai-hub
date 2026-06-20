import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  sendDiscordAirdropAlert,
  sendDiscordNewPost,
  sendDiscordCommunityUpdate,
} from "@/lib/discord"

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
        success = await sendDiscordAirdropAlert({
          airdropName: data.airdropName,
          network: data.network,
          deadline: data.deadline,
          url: data.url,
          difficulty: data.difficulty,
          estimatedReward: data.estimatedReward,
        })
        break

      case "post":
        success = await sendDiscordNewPost({
          title: data.title,
          excerpt: data.excerpt,
          url: data.url,
          category: data.category,
          authorName: data.authorName,
        })
        break

      case "announcement":
      case "maintenance":
      case "update":
        success = await sendDiscordCommunityUpdate({
          title: data.title,
          message: data.message,
          type,
        })
        break

      default:
        return NextResponse.json({ error: "Unknown notification type" }, { status: 400 })
    }

    return NextResponse.json({ success })
  } catch (error) {
    console.error("[discord/webhook] Error:", error)
    return NextResponse.json({ error: "Failed to send Discord notification" }, { status: 500 })
  }
}
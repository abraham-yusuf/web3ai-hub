import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Subscribe to airdrop notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { airdropId, userId, email, telegram, type = "deadline" } = body

    if (!airdropId || !userId) {
      return NextResponse.json(
        { error: "airdropId and userId are required" },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ["deadline", "status_change", "new_task"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Check if airdrop exists
    const airdrop = await prisma.airdrop.findUnique({
      where: { id: airdropId },
      select: { id: true, name: true },
    })

    if (!airdrop) {
      return NextResponse.json({ error: "Airdrop not found" }, { status: 404 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create or update subscription
    const subscription = await prisma.notificationSubscription.upsert({
      where: {
        userId_airdropId_type: {
          userId,
          airdropId,
          type,
        },
      },
      update: {
        email: email || null,
        telegram: telegram || null,
        isActive: true,
      },
      create: {
        userId,
        airdropId,
        type,
        email: email || null,
        telegram: telegram || null,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: `Successfully subscribed to ${type} notifications for ${airdrop.name}`,
    })
  } catch (error) {
    console.error("Notification subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe to notifications" }, { status: 500 })
  }
}
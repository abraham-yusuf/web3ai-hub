import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    // For now, get userId from header (in production, use session/auth)
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: "asc" }, // Unread first
        { createdAt: "desc" }, // Newest first
      ],
    })

    // Get unread count
    const unreadCount = notifications.filter((n) => !n.isRead).length

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 })
    }

    // Mark specified notifications as read
    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId, // Ensure user owns these notifications
      },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notifications update error:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
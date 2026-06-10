import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/analytics/read
 * Track a post read / increment view count.
 * Body: { postId: string }
 */
export async function POST(request: Request) {
  try {
    const { postId } = await request.json()

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "postId required" }, { status: 400 })
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    })

    return NextResponse.json({ postId: post.id, viewCount: post.viewCount })
  } catch (err) {
    console.error("[analytics/read]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
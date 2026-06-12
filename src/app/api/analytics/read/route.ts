import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/analytics/read
 * Track a post read / view count.
 * Body: { postId: string }
 */
export async function POST(request: Request) {
  try {
    const { postId } = await request.json()

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "postId required" }, { status: 400 })
    }

    // Get post slug for the view record
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, slug: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Create a view record
    await prisma.postView.create({
      data: { postId: post.id, slug: post.slug },
    })

    // Get total view count
    const viewCount = await prisma.postView.count({
      where: { postId },
    })

    return NextResponse.json({ postId, viewCount })
  } catch (err) {
    console.error("[analytics/read]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

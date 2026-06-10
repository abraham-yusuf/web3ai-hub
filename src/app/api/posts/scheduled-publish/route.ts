import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// POST /api/posts/scheduled-publish — publish posts whose scheduledFor time has passed
// This should be called by a cron job every 5 minutes
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `****** {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Find all scheduled posts that are due
    const duePosts = await prisma.post.findMany({
      where: {
        scheduledFor: { lte: now },
        published: false,
        status: { not: "PUBLISHED" },
      },
      select: { id: true, slug: true, title: true },
    })

    if (duePosts.length === 0) {
      return NextResponse.json({ published: 0, posts: [] })
    }

    // Publish them
    const result = await prisma.post.updateMany({
      where: {
        id: { in: duePosts.map(p => p.id) },
      },
      data: {
        published: true,
        status: "PUBLISHED",
        publishedAt: now,
      },
    })

    // Revalidate paths
    for (const post of duePosts) {
      revalidatePath("/blog")
      revalidatePath(`/blog/${post.slug}`)
      revalidatePath("/admin/posts")
    }

    return NextResponse.json({
      published: result.count,
      posts: duePosts,
    })
  } catch (error) {
    console.error("Scheduled publish error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET — simple health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    nextScheduled: await prisma.post.findFirst({
      where: {
        scheduledFor: { gt: new Date() },
        published: false,
      },
      select: { title: true, scheduledFor: true },
      orderBy: { scheduledFor: "asc" },
    }),
  })
}
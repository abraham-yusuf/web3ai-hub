import { NextResponse } from "next/server"
import { autoArchiveOpinionNews } from "@/lib/auto-archive"

// POST /api/admin/posts/auto-archive
// Can be called by cron job or manually to archive opinion/news posts older than 90 days
export async function POST(request: Request) {
  try {
    // Verify cron secret if configured
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await autoArchiveOpinionNews()

    if (result.archived > 0) {
      console.info(`[auto-archive] Archived ${result.archived} opinion/news posts`, {
        posts: result.posts.map(p => p.slug),
      })
    }

    return NextResponse.json({
      success: true,
      archived: result.archived,
      posts: result.posts,
    })
  } catch (error) {
    console.error("[auto-archive] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET — health check
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "auto-archive" })
}

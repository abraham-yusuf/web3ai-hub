import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

/**
 * POST /api/posts/scheduled-publish
 * Cron endpoint — publishes posts whose scheduledFor has passed.
 * Can be called by Vercel Cron (via secret) or manually.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // Protect with secret (Vercel Cron uses Authorization: Bearer <secret>)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()

  const result = await prisma.post.updateMany({
    where: {
      scheduledFor: { lte: now },
      published: false,
      status: { in: ["APPROVED", "IN_REVIEW"] },
    },
    data: {
      published: true,
      status: "PUBLISHED",
      publishedAt: now,
    },
  })

  return NextResponse.json({
    published: result.count,
    timestamp: now.toISOString(),
  })
}

// Also support GET for Vercel Cron health check
export async function GET(request: Request) {
  return POST(request)
}
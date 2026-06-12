import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkContentSimilarity } from "@/lib/content-similarity"

export const runtime = "nodejs"

const schema = z.object({
  content: z.string().min(20),
  excludeSlug: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  // Fetch all published posts for comparison
  const existingPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true, content: true },
  })

  const result = checkContentSimilarity(
    parsed.data.content,
    existingPosts,
    parsed.data.excludeSlug
  )

  return NextResponse.json({
    maxSimilarity: result.maxSimilarity,
    blocked: result.blocked,
    matches: result.matches,
    message: result.blocked
      ? "Content similarity exceeds 80% threshold. Provide override reason to publish."
      : undefined,
  })
}

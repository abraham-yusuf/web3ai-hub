import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkContentSimilarity } from "@/lib/content-similarity"
import { revalidatePath } from "next/cache"

export const runtime = "nodejs"

const schema = z.object({
  scheduledFor: z.string().datetime().optional(),
  similarityOverrideReason: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const payload = await request.json().catch(() => null)
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  // Fetch the post
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  // Similarity check before publish (skip if override reason provided)
  if (!parsed.data.similarityOverrideReason) {
    const existingPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, title: true, content: true },
    })

    const similarity = checkContentSimilarity(post.content, existingPosts, post.slug)

    if (similarity.blocked) {
      return NextResponse.json(
        {
          error: "Similarity block",
          message: "Content similarity exceeds 80% threshold. Provide override reason to publish.",
          maxSimilarity: similarity.maxSimilarity,
          matches: similarity.matches,
        },
        { status: 409 }
      )
    }
  }

  // Publish the post
  const now = new Date()
  const updated = await prisma.post.update({
    where: { id },
    data: {
      published: true,
      status: "PUBLISHED",
      publishedAt: parsed.data.scheduledFor ? undefined : now,
      scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : undefined,
      similarityOverrideReason: parsed.data.similarityOverrideReason || null,
    },
  })

  // Revalidate paths
  revalidatePath("/blog")
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath("/admin/posts")

  return NextResponse.json({
    success: true,
    post: {
      id: updated.id,
      slug: updated.slug,
      status: updated.status,
      publishedAt: updated.publishedAt,
      scheduledFor: updated.scheduledFor,
    },
  })
}

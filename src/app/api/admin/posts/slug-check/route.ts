import { ensureSlug } from "@/lib/posts"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = ensureSlug(searchParams.get("slug") ?? "")
  const excludeId = searchParams.get("excludeId")

  if (!slug) {
    return Response.json({ available: false })
  }

  const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  const available = !existing || existing.id === excludeId

  return Response.json({ available })
}

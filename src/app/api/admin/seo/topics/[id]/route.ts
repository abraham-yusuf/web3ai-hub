import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const updateSchema = z.object({
  topic: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  pillarPages: z.string().optional(),
  searchVolume: z.coerce.number().int().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
})

type Props = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params
  const cluster = await prisma.topicCluster.findUnique({ where: { id } })
  if (!cluster) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ cluster })
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 })
    }

    const { keywords, pillarPages, ...rest } = parsed.data

    const cluster = await prisma.topicCluster.update({
      where: { id },
      data: {
        ...rest,
        ...(keywords !== undefined ? { keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean) } : {}),
        ...(pillarPages !== undefined ? { pillarPages: pillarPages.split(",").map((p) => p.trim()).filter(Boolean) } : {}),
      },
    })

    revalidatePath("/admin/seo/topics")
    revalidatePath("/topics/[slug]", "page")
    revalidatePath("/sitemap.xml", "page")

    return NextResponse.json({ cluster })
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("[topic-cluster] Update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const { id } = await params
    await prisma.topicCluster.delete({ where: { id } })
    revalidatePath("/admin/seo/topics")
    revalidatePath("/sitemap.xml", "page")
    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("[topic-cluster] Delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
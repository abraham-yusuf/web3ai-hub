import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const createSchema = z.object({
  topic: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  keywords: z.string().optional(), // comma-separated
  pillarPages: z.string().optional(), // comma-separated
  searchVolume: z.coerce.number().int().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 })
    }

    const { topic, slug, description, keywords, pillarPages, searchVolume, difficulty } = parsed.data

    const cluster = await prisma.topicCluster.create({
      data: {
        topic,
        slug,
        description,
        keywords: keywords ? keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
        pillarPages: pillarPages ? pillarPages.split(",").map((p) => p.trim()).filter(Boolean) : [],
        searchVolume,
        difficulty,
      },
    })

    revalidatePath("/admin/seo/topics")
    revalidatePath("/topics/[slug]", "page")
    revalidatePath("/sitemap.xml", "page")

    return NextResponse.json({ cluster }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Topic or slug already exists" }, { status: 409 })
    }
    console.error("[topic-cluster] Create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  const clusters = await prisma.topicCluster.findMany({ orderBy: { topic: "asc" } })
  return NextResponse.json({ clusters })
}
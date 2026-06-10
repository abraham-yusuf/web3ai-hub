import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tools } = body

    if (!Array.isArray(tools)) {
      return NextResponse.json({ error: "Expected 'tools' to be an array" }, { status: 400 })
    }

    if (tools.length === 0) {
      return NextResponse.json({ error: "Empty array" }, { status: 400 })
    }

    const errors: Array<{ index: number; name: string; error: string }> = []
    let success = 0

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i]
      const slug = toSlug(tool.slug || tool.name || `tool-${i}`)

      try {
        await prisma.aITool.upsert({
          where: { slug },
          create: {
            name: tool.name || slug,
            slug,
            tagline: tool.tagline || null,
            description: tool.description || "No description",
            category: tool.category || "General",
            pricing: tool.pricing || "Freemium",
            rating: Number(tool.rating) || 0,
            affiliateLink: tool.affiliateUrl || tool.affiliateLink || null,
            featured: Boolean(tool.featured),
          },
          update: {
            name: tool.name || slug,
            tagline: tool.tagline || null,
            description: tool.description || "No description",
            category: tool.category || "General",
            pricing: tool.pricing || "Freemium",
            rating: Number(tool.rating) || 0,
            affiliateLink: tool.affiliateUrl || tool.affiliateLink || null,
          },
        })
        success++
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        errors.push({ index: i, name: tool.name || slug, error: message })
      }
    }

    return NextResponse.json({ success, errors })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
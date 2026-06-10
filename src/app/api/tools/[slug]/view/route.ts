import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/tools/[slug]/view — increment view count
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const tool = await prisma.aITool.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true, name: true },
    })

    return NextResponse.json({ success: true, viewCount: tool.viewCount })
  } catch {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Increment helpful count for a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) {
  try {
    const { slug, reviewId } = await params

    // Find tool by slug to verify it exists
    const tool = await prisma.aITool.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    // Find the review and verify it belongs to this tool
    const review = await prisma.toolReview.findFirst({
      where: { 
        id: reviewId,
        toolId: tool.id,
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Increment helpful count
    const updatedReview = await prisma.toolReview.update({
      where: { id: reviewId },
      data: {
        helpful: { increment: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      helpful: updatedReview.helpful,
    })
  } catch (error) {
    console.error("[api/tools/reviews/helpful] Error:", error)
    return NextResponse.json({ error: "Failed to update helpful count" }, { status: 500 })
  }
}
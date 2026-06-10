import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Increment helpful count for a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { reviewId } = await params

    const review = await prisma.airdropReview.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Increment helpful count
    const updatedReview = await prisma.airdropReview.update({
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
    console.error("Helpful vote error:", error)
    return NextResponse.json({ error: "Failed to update helpful count" }, { status: 500 })
  }
}
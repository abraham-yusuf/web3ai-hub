import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch reviews for a tool by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find tool by slug
    const tool = await prisma.aITool.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    const reviews = await prisma.toolReview.findMany({
      where: { 
        toolId: tool.id,
        status: "APPROVED", // Only show approved reviews
      },
      orderBy: { helpful: "desc" },
    })

    // Get user info for each review (by userId)
    const userIds = reviews.map((r) => r.userId).filter((id) => id !== null) as string[]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, username: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const reviewsWithUsers = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      helpful: review.helpful,
      verified: review.verified,
      createdAt: review.createdAt.toISOString(),
      user: review.userId ? userMap.get(review.userId) || null : null,
      userName: review.userName,
    }))

    // Calculate rating summary
    const totalReviews = reviews.length
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    const ratingDistribution = {
      1: reviews.filter((r) => r.rating === 1).length,
      2: reviews.filter((r) => r.rating === 2).length,
      3: reviews.filter((r) => r.rating === 3).length,
      4: reviews.filter((r) => r.rating === 4).length,
      5: reviews.filter((r) => r.rating === 5).length,
    }

    return NextResponse.json({
      reviews: reviewsWithUsers,
      summary: {
        total: totalReviews,
        average: Math.round(avgRating * 10) / 10,
        distribution: ratingDistribution,
      },
    })
  } catch (error) {
    console.error("[api/tools/reviews] Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST - Create or update a review for a tool by slug
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    // For now, we'll use a header or body userId
    // In production, this should come from the session
    const userId = body.userId || request.headers.get("x-user-id")
    const userName = body.userName || "Anonymous"

    const { rating, title, content } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Find tool by slug
    const tool = await prisma.aITool.findUnique({
      where: { slug },
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    // If userId is provided, verify user exists
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    // Check if user already has a review for this tool
    const existingReview = userId
      ? await prisma.toolReview.findFirst({
          where: {
            toolId: tool.id,
            userId,
          },
        })
      : null

    let review
    if (existingReview) {
      // Update existing review
      review = await prisma.toolReview.update({
        where: { id: existingReview.id },
        data: {
          rating,
          title: title || null,
          content: content || null,
          userName: userId ? undefined : userName, // Keep existing userName if logged in
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new review
      review = await prisma.toolReview.create({
        data: {
          toolId: tool.id,
          userId: userId || null,
          userName: userId ? undefined : userName, // Use user's name if logged in, otherwise use provided name
          rating,
          title: title || null,
          content: content || null,
          helpful: 0,
          status: "PENDING", // New reviews need approval
          verified: false,
        },
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("[api/tools/reviews] Create error:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
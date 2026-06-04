import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch reviews for an airdrop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reviews = await prisma.airdropReview.findMany({
      where: { airdropId: id },
      orderBy: { helpful: "desc" },
      include: {
        // Note: Prisma doesn't auto-include relations from User side without explicit relation
        // We'll just return userId and rely on client to fetch user data if needed
      },
    })

    // Get user info for each review
    const userIds = reviews.map((r) => r.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, username: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const reviewsWithUsers = reviews.map((review) => ({
      ...review,
      user: userMap.get(review.userId) || null,
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
    console.error("Reviews fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST - Create or update a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: airdropId } = await params
    const body = await request.json()

    // For now, we'll use a header or body userId
    // In production, this should come from the session
    const userId = body.userId || request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if airdrop exists
    const airdrop = await prisma.airdrop.findUnique({
      where: { id: airdropId },
    })

    if (!airdrop) {
      return NextResponse.json({ error: "Airdrop not found" }, { status: 404 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Upsert review (update if exists, create if not)
    const review = await prisma.airdropReview.upsert({
      where: {
        airdropId_userId: {
          airdropId,
          userId,
        },
      },
      update: {
        rating,
        comment: comment || null,
        updatedAt: new Date(),
      },
      create: {
        airdropId,
        userId,
        rating,
        comment: comment || null,
        helpful: 0,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Review creation error:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
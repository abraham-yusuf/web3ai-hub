import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const bookmarkSchema = z.object({
  toolId: z.string().min(1, "Tool ID is required"),
})

// GET /api/tools/bookmarks - Get user's bookmarks
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const toolId = searchParams.get("toolId")

  // If toolId provided, check if this specific tool is bookmarked
  if (toolId) {
    const bookmark = await prisma.toolBookmark.findUnique({
      where: {
        toolId_userId: {
          toolId,
          userId: session.user.id,
        },
      },
    })
    return NextResponse.json({ bookmarked: !!bookmark })
  }

  // Otherwise return all user's bookmarks
  try {
    const bookmarks = await prisma.toolBookmark.findMany({
      where: { userId: session.user.id },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            tagline: true,
            logo: true,
            category: true,
            pricing: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ bookmarks })
  } catch (error) {
    console.error("Bookmarks fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 })
  }
}

// POST /api/tools/bookmarks - Add a bookmark
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { toolId } = bookmarkSchema.parse(body)

    // Check if tool exists
    const tool = await prisma.aITool.findUnique({
      where: { id: toolId },
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    // Create bookmark (upsert to handle duplicates gracefully)
    const bookmark = await prisma.toolBookmark.upsert({
      where: {
        toolId_userId: {
          toolId,
          userId: session.user.id,
        },
      },
      create: {
        toolId,
        userId: session.user.id,
      },
      update: {},
    })

    return NextResponse.json({ bookmark, message: "Bookmark added" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Bookmark creation error:", error)
    return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 })
  }
}

// DELETE /api/tools/bookmarks - Remove a bookmark
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const toolId = searchParams.get("toolId")

  if (!toolId) {
    return NextResponse.json({ error: "Tool ID is required" }, { status: 400 })
  }

  try {
    await prisma.toolBookmark.deleteMany({
      where: {
        toolId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Bookmark removed" })
  } catch (error) {
    console.error("Bookmark deletion error:", error)
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 })
  }
}
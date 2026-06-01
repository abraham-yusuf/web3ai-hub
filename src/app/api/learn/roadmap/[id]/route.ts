import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params

    const roadmap = await prisma.userRoadmap.findFirst({
      where: { id, userId: session.user.id },
      include: {
        steps: { orderBy: { order: "asc" } },
      },
    })

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
    }

    return NextResponse.json({ roadmap })
  } catch (error) {
    console.error("[GET_ROADMAP_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params

    const roadmap = await prisma.userRoadmap.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
    }

    await prisma.userRoadmap.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE_ROADMAP_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
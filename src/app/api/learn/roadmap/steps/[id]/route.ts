import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params

    // Verify ownership via roadmap
    const step = await prisma.roadmapStep.findUnique({
      where: { id },
      include: { roadmap: { select: { userId: true } } },
    })
    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }
    if (step.roadmap.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    const isCompleted = typeof body?.isCompleted === "boolean" ? body.isCompleted : undefined

    const updated = await prisma.roadmapStep.update({
      where: { id },
      data: {
        isCompleted: isCompleted ?? !step.isCompleted,
      },
    })

    return NextResponse.json({ success: true, step: updated })
  } catch (error) {
    console.error("[TOGGLE_STEP_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
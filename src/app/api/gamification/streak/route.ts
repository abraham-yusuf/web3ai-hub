import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { recordActivity } from "@/lib/gamification"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const xpEarned = typeof body?.xpEarned === "number" ? body.xpEarned : 0

    const result = await recordActivity(session.user.id, xpEarned)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Record activity error:", error)
    return NextResponse.json({ error: "Failed to record activity" }, { status: 500 })
  }
}
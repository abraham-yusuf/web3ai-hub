import { NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/gamification"

export async function GET() {
  try {
    const leaderboard = await getLeaderboard(50)
    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Leaderboard fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
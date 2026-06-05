import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { createReferralLink, useReferralCode } from "@/lib/gamification"

const useReferralSchema = z.object({
  code: z.string().min(1, "Referral code is required"),
})

// GET /api/gamification/referral
// Returns the current user's referral link
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const referralCode = await createReferralLink(session.user.id)

    return NextResponse.json({
      referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://web3ai.hub"}/register?ref=${referralCode}`,
    })
  } catch (error) {
    console.error("Referral link error:", error)
    return NextResponse.json({ error: "Failed to create referral link" }, { status: 500 })
  }
}

// POST /api/gamification/referral
// Uses a referral code for the authenticated user
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const parsed = useReferralSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await useReferralCode(parsed.data.code, session.user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      xpBonus: result.xpBonus,
    })
  } catch (error) {
    console.error("Use referral error:", error)
    return NextResponse.json({ error: "Failed to use referral code" }, { status: 500 })
  }
}
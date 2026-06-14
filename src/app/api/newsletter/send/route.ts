import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// POST /api/newsletter/send
// Admin only — send newsletter to all subscribers
export async function POST(request: NextRequest) {
  const session = await auth()

  // Check admin role
  if (!session?.user?.id || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await request.json().catch(() => null)
    const { subject, html, to } = body || {}

    if (!subject || !html) {
      return NextResponse.json({ error: "subject and html are required" }, { status: 400 })
    }

    if (to !== "all") {
      return NextResponse.json({ error: 'Only to: "all" is supported' }, { status: 400 })
    }

    // TODO: Fetch all subscribers from DB / Resend contacts
    // For now, log and return stub response
    console.log(`[newsletter/send] Sending newsletter: ${subject}`)

    // In production: fetch subscribers list, batch send via Resend API
    // const subscribers = await prisma.emailSubscriber.findMany({ where: { active: true } })
    // Batch send in groups of 50

    return NextResponse.json({
      success: true,
      sent: 0,
      failed: 0,
      message: "Newsletter queued for sending (stub — integrate DB subscribers)",
    })
  } catch (error) {
    console.error("Newsletter send error:", error)
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
  }
}

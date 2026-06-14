import { NextRequest, NextResponse } from "next/server"
import { rateLimit, RATE_LIMIT_TIERS } from "@/lib/rate-limiter"

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  // Rate limiting: 3 requests per IP per hour
  const rateLimitResult = rateLimit(ip, { windowMs: 60 * 60_000, maxRequests: 3 }, "newsletter")
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
        },
      }
    )
  }

  try {
    const body = await request.json().catch(() => null)
    const email = body?.email?.trim()?.toLowerCase()

    if (!email || !/^[^s@]+@[^s@]+.[^s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Send welcome email via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${"placeholder"}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AI3 Hub <noreply@ai3.web.id>",
        to: email,
        subject: "Selamat datang di AI3 Hub! 🚀",
        html: `
          <!DOCTYPE html>
          <html lang="id">
          <head><meta charset="UTF-8"><title>Selamat datang di AI3 Hub</title></head>
          <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h1 style="color:#7c3aed;">🚀 Selamat datang di AI3 Hub!</h1>
            <p>Hei, terima kasih telah subscribe ke newsletter AI3 Hub.</p>
            <p>Kamu akan mendapat update terbaru tentang:</p>
            <ul>
              <li>🤖 AI Tools & Tutorial terbaru</li>
              <li>🪂 Airdrop opportunities</li>
              <li>⛓️ Web3 insights & DeFi tips</li>
              <li>📚 Konten belajar eksklusif</li>
            </ul>
            <p>Selamat menjelajahi dunia AI & Web3 bersama kami!</p>
            <hr style="border:1px solid #e5e7eb;margin:24px 0;">
            <p style="color:#6b7280;font-size:14px;">AI3 Hub — Your AI-native Web3 Learning Platform</p>
            <p style="color:#6b7280;font-size:12px;">Jika kamu tidak merasa subscribe, abaikan email ini.</p>
          </body>
          </html>
        `,
      }),
    })

    if (!resendRes.ok) {
      const resendError = await resendRes.json().catch(() => ({}))
      console.error("Resend error:", resendError)
      // Still return success to not expose internal errors
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil subscribe! Cek email kamu untuk konfirmasi.",
    })
  } catch (error) {
    console.error("Newsletter subscribe error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}

import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { translateText } from "@/lib/translations"
import { rateLimit, RATE_LIMIT_TIERS, rateLimitHeaders, getClientIdentity } from "@/lib/rate-limiter"

export const runtime = "nodejs"

const translateSchema = z.object({
  text: z.string().min(1),
  from: z.enum(["id", "en"]),
  to: z.enum(["id", "en"]),
  format: z.enum(["markdown", "plain"]).optional().default("markdown"),
})

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const identity = session.user.email || getClientIdentity(request)
  const limiter = rateLimit(identity, RATE_LIMIT_TIERS.strict, "translate")

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: limiter.resetAt },
      { status: 429, headers: rateLimitHeaders(limiter) },
    )
  }

  const payload = await request.json().catch(() => null)
  const parsed = translateSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const translated = await translateText(parsed.data.text, parsed.data.from, parsed.data.to)

    return NextResponse.json(
      {
        translated,
        original: parsed.data.text,
        from: parsed.data.from,
        to: parsed.data.to,
      },
      { headers: rateLimitHeaders(limiter) },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
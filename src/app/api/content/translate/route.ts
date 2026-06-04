import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { translateText } from "@/lib/translations"

export const runtime = "nodejs"

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 10

const memoryStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(identity: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const current = memoryStore.get(identity)

  if (!current || current.resetAt <= now) {
    const nextBucket = { count: 1, resetAt: now + WINDOW_MS }
    memoryStore.set(identity, nextBucket)
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: nextBucket.resetAt }
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  memoryStore.set(identity, current)
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - current.count, resetAt: current.resetAt }
}

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

  const identity =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    session.user.email ||
    "unknown"

  const limiter = checkRateLimit(identity)

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: limiter.resetAt },
      {
        status: 429,
        headers: {
          "x-ratelimit-remaining": String(limiter.remaining),
          "x-ratelimit-reset": String(limiter.resetAt),
        },
      },
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
      {
        headers: {
          "x-ratelimit-remaining": String(limiter.remaining),
          "x-ratelimit-reset": String(limiter.resetAt),
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
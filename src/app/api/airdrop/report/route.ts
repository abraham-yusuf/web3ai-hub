import { NextResponse } from "next/server"
import { z } from "zod"

const inputSchema = z.object({
  slug: z.string().min(2),
  message: z.string().min(8),
})

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const parsed = inputSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  console.warn("[airdrop-report]", {
    slug: parsed.data.slug,
    message: parsed.data.message,
  })

  return NextResponse.json({ ok: true })
}

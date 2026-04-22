import { z } from "zod"
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response"

const inputSchema = z.object({
  slug: z.string().min(2),
  message: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = inputSchema.parse(payload)

    console.warn("[airdrop-report]", {
      slug: parsed.slug,
      message: parsed.message,
    })

    return apiSuccessResponse({ ok: true })
  } catch (error) {
    return apiErrorResponse(error, "POST /api/airdrop/report")
  }
}

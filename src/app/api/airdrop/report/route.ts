import { z } from "zod"
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const inputSchema = z.object({
  slug: z.string().min(2),
  message: z.string().min(8),
  reason: z.string().optional().default("other"),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = inputSchema.parse(payload)

    // Look up the airdrop to get its real ID
    const airdrop = await prisma.airdrop.findUnique({
      where: { slug: parsed.slug },
      select: { id: true },
    })

    if (!airdrop) {
      return apiErrorResponse(new Error("Airdrop not found"), "POST /api/airdrop/report")
    }

    // Persist the report
    const report = await prisma.contentReport.create({
      data: {
        contentType: "AIRDROP",
        contentId: airdrop.id,
        reason: parsed.reason,
        message: parsed.message,
      },
    })

    console.info("[airdrop-report] created", { id: report.id, slug: parsed.slug, reason: parsed.reason })

    return apiSuccessResponse({ ok: true, reportId: report.id })
  } catch (error) {
    return apiErrorResponse(error, "POST /api/airdrop/report")
  }
}

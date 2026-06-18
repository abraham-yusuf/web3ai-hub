import { z } from "zod"
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

/**
 * GET /api/moderation — list reports (admin/moderator only)
 */
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiErrorResponse(new Error("Unauthorized"), "GET /api/moderation")
    }

    // Check role: ADMIN or EDITOR can moderate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
      return apiErrorResponse(new Error("Forbidden"), "GET /api/moderation")
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") ?? "PENDING"

    const reports = await prisma.contentReport.findMany({
      where: status === "ALL" ? {} : { status: status as "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED" },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return apiSuccessResponse({ reports, total: reports.length })
  } catch (error) {
    return apiErrorResponse(error, "GET /api/moderation")
  }
}

const actionSchema = z.object({
  reportId: z.string(),
  action: z.enum(["resolve", "dismiss", "review"]),
  resolution: z.string().optional(),
})

/**
 * PATCH /api/moderation — resolve/dismiss a report (admin/moderator only)
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiErrorResponse(new Error("Unauthorized"), "PATCH /api/moderation")
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
      return apiErrorResponse(new Error("Forbidden"), "PATCH /api/moderation")
    }

    const payload = await request.json().catch(() => null)
    const parsed = actionSchema.parse(payload)

    const statusMap = { resolve: "RESOLVED", dismiss: "DISMISSED", review: "REVIEWING" } as const

    const updated = await prisma.contentReport.update({
      where: { id: parsed.reportId },
      data: {
        status: statusMap[parsed.action],
        moderatorId: session.user.id,
        resolution: parsed.resolution ?? null,
      },
    })

    return apiSuccessResponse({ report: updated })
  } catch (error) {
    return apiErrorResponse(error, "PATCH /api/moderation")
  }
}

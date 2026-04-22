import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiErrorResponse, NotFoundError } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug")
    if (!slug) {
      return Response.json({ error: "Missing slug", code: "VALIDATION_ERROR" }, { status: 400 })
    }

    const tool = await prisma.aITool.findUnique({
      where: { slug },
      select: { id: true, affiliateLink: true },
    })

    if (!tool?.affiliateLink) {
      throw new NotFoundError("AI Tool")
    }

    await prisma.affiliateClick.create({
      data: {
        toolId: tool.id,
        referrer: request.headers.get("referer"),
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.redirect(tool.affiliateLink)
  } catch (error) {
    return apiErrorResponse(error, "GET /api/tools/out")
  }
}

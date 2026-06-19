import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiErrorResponse, NotFoundError } from "@/lib/api-response"
import { generateSessionId } from "@/lib/affiliate"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const slug = searchParams.get("slug")
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

    // Enhanced tracking: capture variant, experiment, page source, and session
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const userAgent = request.headers.get("user-agent") ?? ""
    const sessionId = generateSessionId(ip, userAgent)
    const experimentId = searchParams.get("exp") ?? undefined
    const variant = searchParams.get("var") ?? undefined
    const page = searchParams.get("page") ?? undefined

    await prisma.affiliateClick.create({
      data: {
        toolId: tool.id,
        referrer: request.headers.get("referer"),
        userAgent: userAgent || null,
        sessionId,
        experimentId: experimentId || null,
        variant: variant || null,
        page: page || null,
      },
    })

    // Append session ID to affiliate URL for conversion matching
    const affiliateUrl = new URL(tool.affiliateLink)
    affiliateUrl.searchParams.set("utm_source", "web3ai")
    affiliateUrl.searchParams.set("utm_medium", "affiliate")
    affiliateUrl.searchParams.set("utm_campaign", slug)
    if (variant) affiliateUrl.searchParams.set("utm_content", variant)
    affiliateUrl.searchParams.set("ref", sessionId)

    return NextResponse.redirect(affiliateUrl.toString())
  } catch (error) {
    return apiErrorResponse(error, "GET /api/tools/out")
  }
}

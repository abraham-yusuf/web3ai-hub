import { type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiErrorResponse } from "@/lib/api-response"

/**
 * Affiliate conversion postback endpoint.
 *
 * Called by affiliate partners or tracking pixels when a conversion happens.
 * Matches conversions back to clicks via sessionId (passed as `ref` param in the outbound URL).
 *
 * GET /api/affiliate/convert?tool=chatgpt&ref=abc123&type=signup&revenue=0&ext_id=xxx
 * POST /api/affiliate/convert { tool, ref, type, revenue, currency, ext_id, metadata }
 */
export async function GET(request: NextRequest) {
  return handleConversion(request)
}

export async function POST(request: NextRequest) {
  return handleConversion(request)
}

async function handleConversion(request: NextRequest) {
  try {
    const isPost = request.method === "POST"

    let toolSlug: string | null
    let sessionId: string | null
    let type: string
    let revenue: number | null
    let currency: string
    let externalId: string | null
    let metadata: Record<string, unknown> | null = null

    if (isPost) {
      const body = await request.json()
      toolSlug = body.tool ?? null
      sessionId = body.ref ?? body.session_id ?? null
      type = body.type ?? "signup"
      revenue = body.revenue != null ? Number(body.revenue) : null
      currency = body.currency ?? "USD"
      externalId = body.ext_id ?? body.external_id ?? null
      metadata = body.metadata ?? null
    } else {
      const { searchParams } = request.nextUrl
      toolSlug = searchParams.get("tool")
      sessionId = searchParams.get("ref") ?? searchParams.get("session_id")
      type = searchParams.get("type") ?? "signup"
      revenue = searchParams.has("revenue") ? Number(searchParams.get("revenue")) : null
      currency = searchParams.get("currency") ?? "USD"
      externalId = searchParams.get("ext_id")
    }

    if (!toolSlug) {
      return Response.json({ error: "Missing tool slug", code: "VALIDATION_ERROR" }, { status: 400 })
    }

    const tool = await prisma.aITool.findUnique({
      where: { slug: toolSlug },
      select: { id: true },
    })

    if (!tool) {
      return Response.json({ error: "Tool not found", code: "NOT_FOUND" }, { status: 404 })
    }

    await prisma.affiliateConversion.create({
      data: {
        toolId: tool.id,
        sessionId,
        type,
        revenue: revenue != null && !isNaN(revenue) ? revenue : null,
        currency,
        externalId,
        metadata: metadata ?? undefined,
      },
    })

    // Return a 1x1 transparent pixel for tracking pixel use cases
    if (request.headers.get("accept")?.includes("image")) {
      const pixel = Buffer.from(
        "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "base64",
      )
      return new Response(pixel, {
        headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
      })
    }

    return Response.json({ ok: true })
  } catch (error) {
    return apiErrorResponse(error, `${request.method} /api/affiliate/convert`)
  }
}

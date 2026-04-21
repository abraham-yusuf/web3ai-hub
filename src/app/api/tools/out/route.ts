import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  }

  const tool = await prisma.aITool.findUnique({ where: { slug }, select: { id: true, affiliateLink: true } })

  if (!tool?.affiliateLink) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 })
  }

  await prisma.affiliateClick.create({
    data: {
      toolId: tool.id,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    },
  })

  return NextResponse.redirect(tool.affiliateLink)
}

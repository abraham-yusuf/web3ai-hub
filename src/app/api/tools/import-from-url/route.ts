import { NextRequest, NextResponse } from "next/server"
import { importToolFromUrlAction } from "@/app/admin/tools/actions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'url' field" }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only http and https URLs are supported" }, { status: 400 })
    }

    const result = await importToolFromUrlAction(url)

    if ("error" in result) {
      return NextResponse.json(
        { name: "", slug: "", tagline: null, description: "Error fetching URL", error: result.error },
        { status: 422 }
      )
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
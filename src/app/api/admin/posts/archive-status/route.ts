import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/auth"
import { autoArchiveOpinionNews, getArchiveStatus } from "@/lib/auto-archive"

export const runtime = "nodejs"

export async function GET(_request: NextRequest) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const status = await getArchiveStatus()
  return NextResponse.json(status)
}

export async function POST(_request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await autoArchiveOpinionNews()
  return NextResponse.json({
    success: true,
    ...result,
  })
}

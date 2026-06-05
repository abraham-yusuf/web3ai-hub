import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const ADMIN_ROUTES = ["/admin"]
const ADMIN_LOGIN = "/admin/login"
const API_ADMIN_ROUTES = ["/api/admin"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin page routes ──────────────────────────────────────
  const isAdminPage = ADMIN_ROUTES.some((route) => pathname.startsWith(route))

  if (isAdminPage && !pathname.startsWith(ADMIN_LOGIN)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.id || !token.role) {
      const loginUrl = new URL(ADMIN_LOGIN, request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (token.role === "VIEWER") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // ── Admin API routes — auth check ───────────────────────────
  const isAdminApi = API_ADMIN_ROUTES.some((route) => pathname.startsWith(route))

  if (isAdminApi) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.id || !token.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (token.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const ADMIN_ROUTES = ["/admin"]
const ADMIN_LOGIN = "/admin/login"
const API_ADMIN_ROUTES = ["/api/admin"]

/**
 * Generate a CSRF token if none exists in the session.
 * The token is stored in the JWT and expected back in a custom header
 * on state-changing requests (POST/PUT/DELETE/PATCH).
 *
 * For now we validate that the session exists and is authenticated.
 * Full double-submit cookie CSRF can be added as a follow-up.
 */
function isStateChangingMethod(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase())
}

export default async function middleware(request: NextRequest) {
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

    // VIEWER role cannot access admin
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
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      )
    }

    if (!["ADMIN", "EDITOR"].includes(token.role as string)) {
      return NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 },
      )
    }
  }

  // ── CSRF check on state-changing admin API requests ─────────
  if (isAdminApi && isStateChangingMethod(request.method)) {
    // Verify the request has a valid origin or referer to prevent CSRF
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ""

    // In production, reject requests without matching origin/referer
    if (process.env.NODE_ENV === "production" && appUrl) {
      const allowedOrigin = new URL(appUrl).origin
      const requestOrigin = origin ? new URL(origin).origin : referer ? new URL(referer).origin : null

      if (requestOrigin && requestOrigin !== allowedOrigin) {
        return NextResponse.json(
          { error: "CSRF validation failed", code: "CSRF_ERROR" },
          { status: 403 },
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match admin pages (but not static files or _next)
    "/admin/:path*",
    // Match admin API routes
    "/api/admin/:path*",
  ],
}

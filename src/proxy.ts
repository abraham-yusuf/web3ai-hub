import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/** Security headers applied to every response */
const SECURITY_HEADERS = {
  "X-DNS-Prefetch-Control": "on",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.googletagmanager.com/gtag/js",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://og-images.pearlanalytics.ai https://*.vercel.app https://*.amazonaws.com https://images.unsplash.com",
    "connect-src 'self' https://api.coingecko.com https://*.vercel.app wss:",
    "frame-src 'self' https://www.youtube.com https://www.googletagmanager.com",
    "frame-ancestors 'none'",
  ].join("; "),
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  const newResponse = new NextResponse(response.body, response)
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newResponse.headers.set(key, value)
  }
  // Prevent MIME type sniffing
  newResponse.headers.set("X-Content-Type-Options", "nosniff")
  return newResponse
}

const ADMIN_ROUTES = ["/admin"]
const ADMIN_LOGIN = "/admin/login"
const API_ADMIN_ROUTES = ["/api/admin"]
const ADMIN_ALLOWED_ROLES = ["ADMIN", "EDITOR"] as const
const ADMIN_ALLOWED_ROLE_SET = new Set<string>(ADMIN_ALLOWED_ROLES)

function hasAdminAccess(role: unknown): role is (typeof ADMIN_ALLOWED_ROLES)[number] {
  return typeof role === "string" && ADMIN_ALLOWED_ROLE_SET.has(role)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin page routes ──────────────────────────────────────
  const isAdminPage = ADMIN_ROUTES.some((route) => pathname.startsWith(route))

  if (isAdminPage && !pathname.startsWith(ADMIN_LOGIN)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.id || !hasAdminAccess(token.role)) {
      const loginUrl = new URL(ADMIN_LOGIN, request.url)
      const callbackUrl = `${pathname}${request.nextUrl.search}`
      loginUrl.searchParams.set("callbackUrl", callbackUrl)
      return applySecurityHeaders(NextResponse.redirect(loginUrl))
    }
  }

  // ── Admin API routes — auth check ───────────────────────────
  const isAdminApi = API_ADMIN_ROUTES.some((route) => pathname.startsWith(route))

  if (isAdminApi) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.id) {
      return applySecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
    }

    if (!hasAdminAccess(token.role)) {
      return applySecurityHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }))
    }
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

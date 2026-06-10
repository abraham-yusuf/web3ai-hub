import { NextRequest, NextResponse } from "next/server"
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config"

const PUBLIC_PATHS = ["/blog", "/faq", "/glossary", "/learn", "/airdrop", "/ai-tools", "/search", "/topics"]

function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split("/").filter(Boolean)
  const first = segments[0]
  if (first && locales.includes(first as Locale)) {
    return first as Locale
  }
  return null
}

function getLocaleFromHeaders(req: NextRequest): Locale {
  const acceptLang = req.headers.get("accept-language")
  if (!acceptLang) return defaultLocale

  const langs = acceptLang
    .split(",")
    .map((l) => l.split(";")[0].trim().substring(0, 2).toLowerCase())

  for (const lang of langs) {
    if (locales.includes(lang as Locale)) return lang as Locale
  }
  return defaultLocale
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const pathLocale = getLocaleFromPath(pathname)

  if (pathLocale) {
    // URL already has locale prefix — set cookie and continue
    const res = NextResponse.next()
    res.cookies.set("NEXT_LOCALE", pathLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    })
    res.headers.set("x-locale", pathLocale)
    return res
  }

  // No locale in URL — check for locale cookie or header
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value as Locale | undefined
  const locale = cookieLocale && locales.includes(cookieLocale)
    ? cookieLocale
    : getLocaleFromHeaders(req)

  // Redirect to locale-prefixed path for public content
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  if (isPublicPath) {
    const url = req.nextUrl.clone()
    url.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(url)
  }

  // Non-public paths: set locale header for server components to read
  const res = NextResponse.next()
  res.headers.set("x-locale", locale)
  return res
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
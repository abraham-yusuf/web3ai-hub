/**
 * i18n utilities for multi-language routing support.
 * Supports /id/ and /en/ URL prefixes with locale detection and path manipulation.
 */

export const SUPPORTED_LOCALES = ["id", "en"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  id: "🇮🇩",
  en: "🇬🇧",
}

const LOCALE_COOKIE = "NEXT_LOCALE"
const DEFAULT_LOCALE: Locale = "id"

/**
 * Detect the locale from a Request object.
 * Priority: 1. Cookie "NEXT_LOCALE", 2. Accept-Language header
 */
export function detectLocale(request: Request): Locale {
  // Check cookie first
  const cookieHeader = request.headers.get("cookie") ?? ""
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=")
      return [key, val.join("=")]
    })
  )

  if (cookies[LOCALE_COOKIE] && isSupportedLocale(cookies[LOCALE_COOKIE])) {
    return cookies[LOCALE_COOKIE] as Locale
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") ?? ""
  const locale = parseAcceptLanguage(acceptLanguage)
  if (locale) return locale

  return DEFAULT_LOCALE
}

// Re-export cookie name for use in language switcher
export { LOCALE_COOKIE as NEXT_LOCALE }

/**
 * Parse Accept-Language header and return the best matching supported locale.
 * e.g., "en-US,en;q=0.9,id;q=0.8" -> "en"
 */
function parseAcceptLanguage(header: string): Locale | null {
  const parts = header.split(",").map((part) => {
    const [lang, qStr] = part.trim().split(";q=")
    const q = qStr ? parseFloat(qStr) : 1.0
    return { lang: lang.trim(), q }
  })

  parts.sort((a, b) => b.q - a.q)

  for (const { lang } of parts) {
    // Try exact match first (e.g., "en-US")
    if (isSupportedLocale(lang)) {
      return lang as Locale
    }
    // Try language-only match (e.g., "en" from "en-US")
    const langOnly = lang.split("-")[0].toLowerCase()
    if (isSupportedLocale(langOnly)) {
      return langOnly as Locale
    }
  }

  return null
}

/**
 * Check if a string is a supported locale.
 */
export function isSupportedLocale(value: string | null | undefined): value is Locale {
  if (!value) return false
  return SUPPORTED_LOCALES.includes(value as Locale)
}

/**
 * Extract locale from a path prefix.
 * e.g., "/id/blog" -> "id", "/en/blog" -> "en", "/blog" -> null
 */
export function getLocaleFromPath(path: string): Locale | null {
  const match = path.match(/^\/(id|en)(\/|$)/)
  if (match) {
    return match[1] as Locale
  }
  return null
}

/**
 * Remove locale prefix from a path.
 * e.g., "/id/blog" -> "/blog", "/en/blog" -> "/blog", "/blog" -> "/blog"
 */
export function stripLocaleFromPath(path: string): string {
  return path.replace(/^\/(id|en)/, "")
}

/**
 * Add locale prefix to a path.
 * e.g., "/blog" + "en" -> "/en/blog", "/blog" + "id" -> "/id/blog"
 */
export function addLocaleToPath(path: string, locale: Locale): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  // Remove any existing locale prefix first
  const stripped = stripLocaleFromPath(normalizedPath)
  // Handle root path case: "/" becomes "/id" not "/id/"
  if (stripped === "" || stripped === "/") {
    return `/${locale}`
  }
  return `/${locale}${stripped}`
}

/**
 * Get the alternate URLs for hreflang tags.
 * Returns an object mapping locale codes to URLs.
 */
export function getAlternateUrls(
  path: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL ?? "https://ai3.my.id"
): Record<string, string> {
  const strippedPath = stripLocaleFromPath(path)
  return {
    "en-US": `${baseUrl}/en${strippedPath}`,
    "id-ID": `${baseUrl}/id${strippedPath}`,
    "x-default": `${baseUrl}${strippedPath}`,
  }
}
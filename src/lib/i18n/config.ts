export type ContentLocale = "ID" | "EN"

export const locales = ["id", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "id"

export const localeNames: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
}

export const localeFlags: Record<Locale, string> = {
  id: "🇮🇩",
  en: "🇬🇧",
}

/**
 * Safely parse a locale string from URL params or headers.
 * Falls back to default if invalid.
 */
export function parseLocale(value: string | undefined | null): Locale {
  if (value && locales.includes(value as Locale)) {
    return value as Locale
  }
  return defaultLocale
}

/**
 * Convert ContentLocale (Prisma enum) to our Locale type.
 */
export function fromContentLocale(cl: ContentLocale): Locale {
  return cl === "EN" ? "en" : "id"
}

/**
 * Convert our Locale type to ContentLocale (Prisma enum).
 */
export function toContentLocale(loc: Locale): ContentLocale {
  return loc === "en" ? "EN" : "ID"
}

/**
 * Get the other locale (for translation links).
 */
export function otherLocale(loc: Locale): Locale {
  return loc === "en" ? "id" : "en"
}
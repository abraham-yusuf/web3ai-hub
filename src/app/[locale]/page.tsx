import { redirect } from "next/navigation"
import { parseLocale, type Locale } from "@/lib/i18n/config"

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function LocaleRootPage({ params }: PageProps) {
  const { locale } = await params
  const loc = parseLocale(locale)
  // Redirect locale root to main site root
  // The root page (/ ) is not locale-specific — it serves all locales
  redirect("/")
}

export function generateStaticParams() {
  return [{ locale: "id" }, { locale: "en" }]
}
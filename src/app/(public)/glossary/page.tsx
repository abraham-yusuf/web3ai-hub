import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import {
  JsonLdScript,
  buildGlossaryPageJsonLd,
} from "@/components/seo/json-ld-data"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const LANGUAGE_LABELS: Record<string, string> = {
  id: "Bahasa Indonesia",
  en: "English",
}

export const metadata: Metadata = generateSeo({
  title: "Glossary",
  description:
    "Daftar istilah Web3 & AI dalam Bahasa Indonesia dan English. Pelajari definisi, contoh, dan kategori untuk menguasai kosakata blockchain, DeFi, NFT, AI, dan lainnya.",
  type: "website",
  canonical: "/glossary",
})

interface Props {
  searchParams: Promise<{ lang?: string }>
}

export default async function GlossaryIndexPage({ searchParams }: Props) {
  const params = await searchParams
  const lang = params.lang ?? "all"

  const where = {
    isPublished: true,
    ...(lang !== "all" ? { language: lang } : {}),
  }

  const entries = await prisma.glossaryEntry.findMany({
    where,
    orderBy: { term: "asc" },
    select: {
      id: true,
      term: true,
      slug: true,
      definition: true,
      category: true,
      language: true,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ai3.my.id"
  const glossaryJsonLd = buildGlossaryPageJsonLd(entries, baseUrl)

  // Group entries: by category if categories exist, otherwise by first letter
  const hasCategories = entries.some((e) => e.category)
  const grouped: Record<string, typeof entries> = {}

  if (hasCategories) {
    for (const entry of entries) {
      const key = entry.category ?? "Uncategorized"
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(entry)
    }
  } else {
    for (const entry of entries) {
      const firstLetter = entry.term.charAt(0).toUpperCase()
      if (!grouped[firstLetter]) grouped[firstLetter] = []
      grouped[firstLetter].push(entry)
    }
  }

  const sortedKeys = Object.keys(grouped).sort()

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <JsonLdScript json={glossaryJsonLd} id="glossary-page-json-ld" />

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Glossary</h1>
        <p className="text-lg text-muted-foreground">
          Daftar istilah Web3 & AI dalam Bahasa Indonesia dan English. Jelajahi
          definisi, contoh, dan kategori untuk menguasai kosakata blockchain,
          DeFi, NFT, AI, dan lainnya.
        </p>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "All" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "en", label: "English" },
        ].map(({ value, label }) => (
          <Link
            key={value}
            href={value === "all" ? "/glossary" : `/glossary?lang=${value}`}
            className={`inline-flex h-9 items-center rounded-md px-4 text-sm font-medium transition-colors ${
              lang === value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Content */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p>Belum ada glossary entry.</p>
          {lang !== "all" && (
            <p className="mt-1 text-sm">
              Coba pilih bahasa lain atau{" "}
              <Link href="/glossary" className="underline">
                lihat semua
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {sortedKeys.map((key) => (
            <section key={key} className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">{key}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[key].map((entry) => (
                  <Link key={entry.id} href={`/glossary/${entry.slug}`}>
                    <Card className="h-full transition-colors hover:border-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base leading-snug">
                            {entry.term}
                          </CardTitle>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {LANGUAGE_LABELS[entry.language] ?? entry.language}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {entry.definition}
                        </p>
                        {entry.category && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {entry.category}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
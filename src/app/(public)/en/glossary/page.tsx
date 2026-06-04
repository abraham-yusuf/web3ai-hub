import { prisma } from "@/lib/prisma"
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

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Web3 & AI glossary terms in English and Indonesian. Learn definitions, examples, and categories to master blockchain, DeFi, NFT, AI, and more vocabulary.",
  alternates: {
    canonical: "/en/glossary",
    languages: {
      "en-US": "/en/glossary",
      "id-ID": "/glossary",
    },
  },
}

export default async function EnGlossaryIndexPage() {
  // Fetch English entries first, then fall back to all if none exist
  const entries = await prisma.glossaryEntry.findMany({
    where: {
      isPublished: true,
      language: "en",
    },
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

  // If no English entries, show all entries
  const displayEntries = entries.length > 0 ? entries : await prisma.glossaryEntry.findMany({
    where: { isPublished: true },
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
  const glossaryJsonLd = buildGlossaryPageJsonLd(displayEntries, baseUrl)

  // Group entries: by category if categories exist, otherwise by first letter
  const hasCategories = displayEntries.some((e) => e.category)
  const grouped: Record<string, typeof displayEntries> = {}

  if (hasCategories) {
    for (const entry of displayEntries) {
      const key = entry.category ?? "Uncategorized"
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(entry)
    }
  } else {
    for (const entry of displayEntries) {
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
          Web3 & AI glossary terms in English and Indonesian. Explore
          definitions, examples, and categories to master blockchain,
          DeFi, NFT, AI, and more vocabulary.
        </p>
      </div>

      {/* Language indicator */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/en/glossary"
          className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium bg-primary text-primary-foreground"
        >
          English
        </Link>
        <Link
          href="/glossary?lang=id"
          className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium border border-border bg-background hover:bg-muted"
        >
          Bahasa Indonesia
        </Link>
        <Link
          href="/glossary"
          className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium border border-border bg-background hover:bg-muted"
        >
          All Languages
        </Link>
      </div>

      {/* Content */}
      {displayEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p>No glossary entries available yet.</p>
          <p className="mt-1 text-sm">
            Check back later or{" "}
            <Link href="/glossary" className="underline">
              browse in other languages
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedKeys.map((key) => (
            <section key={key} className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">{key}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[key].map((entry) => (
                  <Link key={entry.id} href={`/en/glossary/${entry.slug}`}>
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
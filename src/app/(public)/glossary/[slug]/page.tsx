import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import {
  JsonLdScript,
  buildGlossaryTermJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/seo/json-ld-data"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"

const LANGUAGE_LABELS: Record<string, string> = {
  id: "Bahasa Indonesia",
  en: "English",
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = await prisma.glossaryEntry.findUnique({
    where: { slug, isPublished: true },
  })

  if (!entry) return { title: "Term Not Found" }

  const description =
    entry.definition.length > 160
      ? entry.definition.slice(0, 157) + "..."
      : entry.definition

  return generateSeo({
    title: `${entry.term} — Glossary`,
    description,
    type: "blog_post",
    canonical: `/glossary/${entry.slug}`,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Glossary", href: "/glossary" },
      { label: entry.term, href: `/glossary/${entry.slug}` },
    ],
  })
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params

  const entry = await prisma.glossaryEntry.findUnique({
    where: { slug, isPublished: true },
  })

  if (!entry) notFound()

  // Fetch related entries (same category, different slug, limit 5)
  const relatedEntries = entry.category
    ? await prisma.glossaryEntry.findMany({
        where: {
          category: entry.category,
          isPublished: true,
          slug: { not: entry.slug },
        },
        select: { id: true, term: true, slug: true, definition: true, language: true },
        take: 5,
        orderBy: { term: "asc" },
      })
    : []

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ai3.my.id"
  const termJsonLd = buildGlossaryTermJsonLd(entry)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { label: "Home", href: "/" },
      { label: "Glossary", href: "/glossary" },
      { label: entry.term, href: `/glossary/${entry.slug}` },
    ],
    baseUrl
  )

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <JsonLdScript json={termJsonLd} id="glossary-term-json-ld" />
      <JsonLdScript json={breadcrumbJsonLd} id="breadcrumb-json-ld" />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/glossary" className="hover:text-foreground transition-colors">
          Glossary
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{entry.term}</span>
      </nav>

      {/* Term Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {entry.category && (
            <Badge variant="secondary">{entry.category}</Badge>
          )}
          <Badge variant="outline">
            {LANGUAGE_LABELS[entry.language] ?? entry.language}
          </Badge>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">{entry.term}</h1>
      </div>

      {/* Definition */}
      <div className="space-y-4">
        <div className="text-xl leading-relaxed text-foreground">
          {entry.definition}
        </div>

        {/* Example */}
        {entry.example && (
          <div className="rounded-xl border-l-4 border-primary bg-muted/50 p-5">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Contoh / Example
            </p>
            <blockquote className="text-base italic text-foreground">
              {entry.example}
            </blockquote>
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Related Terms */}
      {relatedEntries.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            Istilah Sejenis / Related Terms
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedEntries.map((related) => (
              <Link key={related.id} href={`/glossary/${related.slug}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">
                        {related.term}
                      </CardTitle>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {LANGUAGE_LABELS[related.language] ?? related.language}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {related.definition}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to Glossary */}
      <div>
        <Link
          href="/glossary"
          className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted transition-colors"
        >
          ← Kembali ke Glossary
        </Link>
      </div>
    </div>
  )
}
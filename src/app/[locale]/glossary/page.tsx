import { prisma } from "@/lib/prisma"
import { parseLocale, otherLocale } from "@/lib/i18n/config"
import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const loc = parseLocale(locale)
  const isEn = loc === "en"

  return {
    title: "Glossary — AI3",
    description: isEn
      ? "Browse AI and Web3 terms and definitions in our comprehensive glossary."
      : "Jelajahi istilah dan definisi AI serta Web3 dalam glosarium komprehensif kami.",
    alternates: {
      canonical: `/${loc}/glossary`,
    },
  }
}

export function generateStaticParams() {
  return [{ locale: "id" }, { locale: "en" }]
}

function getLetterGroup(term: string): string {
  const firstChar = term.charAt(0).toUpperCase()
  if (/[A-Z]/.test(firstChar)) {
    return firstChar
  }
  return "#"
}

export default async function GlossaryPage({ params }: PageProps) {
  const { locale } = await params
  const loc = parseLocale(locale)
  const isEn = loc === "en"
  const lang = isEn ? "en" : "id"
  const otherLoc = otherLocale(loc)

  const entries = await prisma.glossaryEntry.findMany({
    where: { language: lang, isPublished: true },
    orderBy: { term: "asc" },
  })

  // Group entries by first letter
  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const letter = getLetterGroup(entry.term)
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(entry)
    return acc
  }, {})

  const letters = Object.keys(grouped).sort((a, b) => {
    if (a === "#") return 1
    if (b === "#") return -1
    return a.localeCompare(b)
  })

  const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"]

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">
            {isEn ? "Glossary" : "Glosarium"}
          </h1>
          <Link href={`/${otherLoc}/glossary`}>
            <Badge variant="secondary" className="cursor-pointer hover:opacity-80">
              {otherLoc === "en" ? "🇬🇧 English" : "🇮🇩 Indonesia"}
            </Badge>
          </Link>
        </div>
        <p className="text-lg text-muted-foreground">
          {isEn
            ? "Comprehensive dictionary of AI and Web3 terms."
            : "Kamus komprehensif istilah AI dan Web3."}
        </p>
      </div>

      {/* Alphabet Navigation */}
      {letters.length > 0 && (
        <div className="sticky top-14 z-10 bg-background border-b py-3">
          <div className="flex flex-wrap gap-1 justify-center">
            {alphabet.map((letter) => (
              <a
                key={letter}
                href={letters.includes(letter) ? `#letter-${letter}` : undefined}
                className={
                  letters.includes(letter)
                    ? "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors"
                    : "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-muted-foreground cursor-default"
                }
                aria-disabled={!letters.includes(letter)}
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Glossary Entries */}
      {letters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isEn
              ? "No glossary entries yet. Check back soon!"
              : "Belum ada entri glosarium. Cek lagi nanti!"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="text-2xl font-bold mb-4 scroll-mt-20 sticky top-[72px] bg-background py-2 z-[5]">
                {letter}
              </h2>
              <div className="space-y-4">
                {grouped[letter].map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{entry.term}</h3>
                        {entry.category && (
                          <Badge variant="outline" className="shrink-0">
                            {entry.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {entry.definition}
                      </p>
                      {entry.example && (
                        <p className="mt-3 text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                          {entry.example}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
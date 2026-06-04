import { prisma } from "@/lib/prisma"
import { JsonLdScript, buildFaqJsonLd } from "@/components/seo/json-ld-data"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Web3, AI, and the AI3 platform. Find answers for billing, technical topics, and more.",
  alternates: {
    canonical: "/en/faq",
    languages: {
      "en-US": "/en/faq",
      "id-ID": "/faq",
    },
  },
}

type FaqItem = {
  id: string
  question: string
  answer: string
  category: string | null
  language: string
}

export default async function EnFaqIndexPage() {
  // Fetch English entries first
  const faqs = await prisma.faq.findMany({
    where: {
      isPublished: true,
      language: "en",
    },
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      language: true,
    },
  })

  // If no English entries, show all entries
  const displayFaqs = faqs.length > 0 ? faqs : await prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      language: true,
    },
  })

  const faqJsonLd = buildFaqJsonLd(displayFaqs)

  // Group by category
  const hasCategories = displayFaqs.some((f: FaqItem) => f.category)
  const grouped: Record<string, FaqItem[]> = {}

  if (hasCategories) {
    for (const faq of displayFaqs) {
      const key = faq.category ?? "General"
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(faq)
    }
  } else {
    grouped["FAQ"] = displayFaqs
  }

  const sortedKeys = Object.keys(grouped).sort()

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <JsonLdScript json={faqJsonLd} id="faq-page-json-ld" />

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">FAQ</h1>
        <p className="text-lg text-muted-foreground">
          Frequently asked questions about Web3, AI, and the AI3 platform.
          Find answers for billing, technical topics, and more.
        </p>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/en/faq"
          className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium bg-primary text-primary-foreground"
        >
          English
        </Link>
        <Link
          href="/faq?lang=id"
          className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium border border-border bg-background hover:bg-muted"
        >
          Bahasa Indonesia
        </Link>
        <Link
          href="/faq"
          className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium border border-border bg-background hover:bg-muted"
        >
          All Languages
        </Link>
      </div>

      {/* Content */}
      {displayFaqs.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p>No FAQs published yet.</p>
          <p className="mt-1 text-sm">
            Check back later or{" "}
            <Link href="/faq" className="underline">
              browse in other languages
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedKeys.map((category) => (
            <section key={category} className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight border-b pb-2">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h2>
              <div className="space-y-2">
                {grouped[category].map((faq: FaqItem) => (
                  <details
                    key={faq.id}
                    className="group rounded-lg border bg-background open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 font-medium hover:bg-muted/50 list-none">
                      <span>{faq.question}</span>
                      <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
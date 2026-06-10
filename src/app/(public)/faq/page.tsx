import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import { JsonLdScript, buildFaqJsonLd } from "@/components/seo/json-ld-data"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = generateSeo({
  title: "FAQ",
  description:
    "Pertanyaan yang sering diajukan tentang Web3, AI, dan platform AI3. Temukan jawaban untuk topik billing, teknis, dan lainnya.",
  type: "website",
  canonical: "/faq",
})

type FaqItem = {
  id: string
  question: string
  answer: string
  category: string | null
  language: string
}

export default async function FaqIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const params = await searchParams
  const lang = params.lang ?? "all"

  const where = {
    isPublished: true,
    ...(lang !== "all" ? { language: lang } : {}),
  }

  const faqs = await prisma.faq.findMany({
    where,
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      language: true,
    },
  })

  const faqJsonLd = buildFaqJsonLd(faqs)

  // Group by category
  const hasCategories = faqs.some((f: FaqItem) => f.category)
  const grouped: Record<string, FaqItem[]> = {}

  if (hasCategories) {
    for (const faq of faqs) {
      const key = faq.category ?? "General"
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(faq)
    }
  } else {
    grouped["FAQ"] = faqs
  }

  const sortedKeys = Object.keys(grouped).sort()

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <JsonLdScript json={faqJsonLd} id="faq-page-json-ld" />

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">FAQ</h1>
        <p className="text-lg text-muted-foreground">
          Pertanyaan yang sering diajukan tentang Web3, AI, dan platform AI3.
          Temukan jawaban untuk topik billing, teknis, dan lainnya.
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
            href={value === "all" ? "/faq" : `/faq?lang=${value}`}
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
      {faqs.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p>Belum ada FAQ yang dipublikasikan.</p>
          {lang !== "all" && (
            <p className="mt-1 text-sm">
              Coba pilih bahasa lain atau{" "}
              <Link href="/faq" className="underline">
                lihat semua
              </Link>
              .
            </p>
          )}
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
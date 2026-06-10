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
    title: isEn ? "FAQ — AI3" : "FAQ — AI3",
    description: isEn
      ? "Frequently asked questions about Web3, AI tools, airdrops, and the AI3 platform."
      : "Pertanyaan yang sering ditanyakan tentang Web3, alat AI, airdrop, dan platform AI3.",
    alternates: {
      canonical: `/${loc}/faq`,
    },
  }
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params
  const loc = parseLocale(locale)
  const lang = isEn ? "en" : "id"
  const isEn = loc === "en"

  const faqs = await prisma.faq.findMany({
    where: { language: lang, isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })

  // Group by category
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const cat = faq.category ?? "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(faq)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()
  const otherLoc = otherLocale(loc)

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">
            {isEn ? "FAQ" : "Pertanyaan Umum"}
          </h1>
          <Link href={`/${otherLoc}/faq`}>
            <Badge variant="secondary" className="cursor-pointer hover:opacity-80">
              {otherLoc === "en" ? "🇬🇧 English" : "🇮🇩 Indonesia"}
            </Badge>
          </Link>
        </div>
        <p className="text-lg text-muted-foreground">
          {isEn
            ? "Everything you need to know about AI3, Web3, and crypto."
            : "Segala yang perlu kamu ketahui tentang AI3, Web3, dan kripto."}
        </p>
      </div>

      {/* Category nav */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 sticky top-14 z-10 bg-background py-3 border-b">
          {categories.map((cat) => (
            <a key={cat} href={`#cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                {cat}
              </Badge>
            </a>
          ))}
        </div>
      )}

      {/* FAQ Items */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isEn
              ? "No FAQ items yet. Check back soon!"
              : "Belum ada FAQ. Cek lagi nanti!"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category} id={`cat-${category.toLowerCase().replace(/\s+/g, "-")}`}>
              <h2 className="text-xl font-semibold mb-4 scroll-mt-20">{category}</h2>
              <div className="space-y-3">
                {grouped[category].map((faq) => (
                  <Card key={faq.id} className="group">
                    <CardContent className="p-5">
                      <h3 className="font-medium text-base mb-2 group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
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
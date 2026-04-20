import { AdSlot } from "@/components/ads/ad-slot"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getLearnNavigation } from "@/lib/learn"
import { ArrowRight, Book } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Learn",
  description: "Pilih jalur pembelajaran Web3 dan AI yang terstruktur.",
  alternates: { canonical: "/learn" },
}

export default async function LearnIndexPage() {
  const structure = await getLearnNavigation()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Materi Pembelajaran</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Pilih jalur pembelajaran untuk mulai menguasai teknologi Web3 dan AI.
        </p>
      </div>

      <AdSlot section="learn_list" className="rounded-xl border p-4" />

      <div className="grid gap-6">
        {structure.map((track) => (
          <Card key={track.slug}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Book className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{track.title}</CardTitle>
                <CardDescription>{track.sections.reduce((count, section) => count + section.pages.length, 0)} Materi</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {track.sections.flatMap((section) => section.pages).map((page) => (
                  <Link
                    key={page.slug}
                    href={`/learn/${page.slug}`}
                    className="group flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="text-muted-foreground group-hover:text-primary">{page.order}.</span>
                    <span className="flex-1">{page.title}</span>
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <InternalLinksBlock />
    </div>
  )
}

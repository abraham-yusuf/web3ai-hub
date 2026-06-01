import { auth } from "@/auth"

import { InternalLinksBlock } from "@/components/layout/internal-links"
import { ActiveRoadmapsBanner } from "@/components/learn/active-roadmaps-banner"
import { LearnRetentionDashboard } from "@/components/learn/learn-retention-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getLearnNavigation } from "@/lib/learn"
import { prisma } from "@/lib/prisma"
import { ArrowRight, Book } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Learn",
  description: "Pilih jalur pembelajaran Web3 dan AI yang terstruktur.",
  alternates: { canonical: "/learn" },
}

export default async function LearnIndexPage() {
  const structure = await getLearnNavigation()
  const session = await auth()
  const completedProgress = session?.user?.id
    ? await prisma.learnProgress.findMany({
        where: {
          userId: session.user.id,
          completed: true,
        },
        select: { pageSlug: true },
      })
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Materi Pembelajaran</h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">
          Pilih jalur pembelajaran untuk mulai menguasai teknologi Web3 dan AI.
        </p>
      </div>

      <ActiveRoadmapsBanner />

      <LearnRetentionDashboard tracks={structure} initialCompletedSlugs={completedProgress.map((item: { pageSlug: string }) => item.pageSlug)} />

      <div className="grid gap-6">
        {structure.map((track) => (
          <Card key={track.slug}>
            <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Book className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{track.title}</CardTitle>
                <CardDescription className="text-sm">
                  {track.sections.reduce((count, section) => count + section.pages.length, 0)} Materi
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {track.sections.flatMap((section) => section.pages).map((page) => (
                  <Link
                    key={page.slug}
                    href={`/learn/${page.slug}`}
                    className="group flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
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

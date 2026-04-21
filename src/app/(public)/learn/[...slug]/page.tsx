import { AdSlot } from "@/components/ads/ad-slot"
import { LearnChatSidebar } from "@/components/learn/learn-chat-sidebar"
import { ProgressTracker } from "@/components/learn/progress-tracker"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { components } from "@/components/mdx"
import { getLearnPageBySlug, getLearnPagination } from "@/lib/learn"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import { notFound } from "next/navigation"

interface LearnPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
  const { slug } = await params
  const slugPath = slug.join("/")
  const page = await getLearnPageBySlug(slugPath)

  if (!page) {
    return { title: "Materi tidak ditemukan" }
  }

  return {
    title: page.title,
    description: page.excerpt,
    alternates: { canonical: `/learn/${slugPath}` },
  }
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params
  const slugPath = slug.join("/")
  const page = await getLearnPageBySlug(slugPath)

  if (!page) {
    notFound()
  }

  const { prev, next } = await getLearnPagination(slugPath)

  const session = await auth()
  const progress = session?.user?.id
    ? await prisma.learnProgress.findUnique({
        where: {
          userId_pageSlug: {
            userId: session.user.id,
            pageSlug: slugPath,
          },
        },
        select: { completed: true },
      })
    : null

  return (
    <article className="space-y-8 py-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/learn" className="hover:text-primary">Learn</Link>
        {page.trackTitle && <span> / {page.trackTitle}</span>}
        {page.sectionTitle && <span> / {page.sectionTitle}</span>}
        <span> / {page.title}</span>
      </nav>

      <ProgressTracker pageSlug={slugPath} initialCompleted={progress?.completed ?? false} />

      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={page.content} components={components} />
      </div>

      <div className="grid gap-3 border-t pt-6 md:grid-cols-2">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="rounded-lg border p-4 transition-colors hover:border-primary">
            <p className="text-xs text-muted-foreground">← Previous Lesson</p>
            <p className="mt-1 font-medium">{prev.title}</p>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Ini lesson pertama.</div>
        )}

        {next ? (
          <Link href={`/learn/${next.slug}`} className="rounded-lg border p-4 text-right transition-colors hover:border-primary">
            <p className="text-xs text-muted-foreground">Next Lesson →</p>
            <p className="mt-1 font-medium">{next.title}</p>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Ini lesson terakhir.</div>
        )}
      </div>

      <AdSlot section="learn_detail" className="rounded-xl border p-4" />
      <InternalLinksBlock />
      <LearnChatSidebar title={page.title} context={page.content} />
    </article>
  )
}

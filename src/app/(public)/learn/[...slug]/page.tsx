import { AdSlot } from "@/components/ads/ad-slot"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { components } from "@/components/mdx"
import { getFileBySlug } from "@/lib/mdx"
import type { Metadata } from "next"
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
  const page = getFileBySlug("learn", slugPath)

  if (!page) {
    return { title: "Materi tidak ditemukan" }
  }

  return {
    title: page.frontMatter.title,
    description: page.frontMatter.excerpt,
    alternates: { canonical: `/${slugPath}` },
  }
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params
  const slugPath = slug.join("/")
  const page = getFileBySlug("learn", slugPath)

  if (!page) {
    notFound()
  }

  return (
    <article className="space-y-8 py-6">
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={page.content} components={components} />
      </div>

      <AdSlot section="learn_detail" className="rounded-xl border p-4" />
      <InternalLinksBlock />
    </article>
  )
}

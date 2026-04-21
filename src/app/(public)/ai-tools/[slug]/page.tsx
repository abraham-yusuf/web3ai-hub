import { AdSlot } from "@/components/ads/ad-slot"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"
import { ExternalLink, Star } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

interface AiToolDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: AiToolDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const tool = await prisma.aITool.findUnique({ where: { slug } })

  if (!tool) {
    return { title: "Tool tidak ditemukan" }
  }

  return {
    title: tool.name,
    description: tool.tagline ?? tool.description.slice(0, 150),
    alternates: { canonical: `/ai-tools/${tool.slug}` },
  }
}

export default async function AiToolDetailPage({ params }: AiToolDetailPageProps) {
  const { slug } = await params

  const tool = await prisma.aITool.findUnique({
    where: { slug },
  })

  if (!tool) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="flex flex-col items-start gap-8 md:flex-row">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-muted text-4xl font-bold">
          {tool.name[0]}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{tool.category}</Badge>
            <Badge variant="outline">{tool.pricing}</Badge>
            {tool.featured && <Badge>Featured</Badge>}
            <div className="ml-auto flex items-center gap-1 text-sm font-bold text-amber-500 md:ml-0">
              <Star className="h-4 w-4 fill-current" />
              {tool.rating}
            </div>
          </div>
          <h1 className="text-4xl font-bold">{tool.name}</h1>
          <p className="text-xl text-muted-foreground">{tool.tagline}</p>
          {tool.affiliateLink && (
            <a
              href={`/api/tools/out?slug=${tool.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg", className: "h-12 px-8" })}
            >
              Coba {tool.name} <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          )}
          <a href={`/ai-tools?compare=${tool.slug}`} className="inline-flex h-9 items-center rounded-md border px-3 text-xs font-medium">Add to Compare</a>
        </div>
      </div>

      <AdSlot section="tools_detail" className="rounded-xl border p-4" />

      <Separator />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Tentang {tool.name}</h2>
        <div className="prose prose-zinc max-w-none whitespace-pre-wrap dark:prose-invert">{tool.description}</div>
      </div>

      <InternalLinksBlock />
    </div>
  )
}

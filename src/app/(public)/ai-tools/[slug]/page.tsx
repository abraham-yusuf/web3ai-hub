import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Star, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return []
}

export default async function AiToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const tool = await prisma.aITool.findUnique({
    where: { slug }
  })

  if (!tool) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center text-4xl font-bold shrink-0">
          {tool.name[0]}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{tool.category}</Badge>
            <Badge variant="outline">{tool.pricing}</Badge>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-500 ml-auto md:ml-0">
              <Star className="h-4 w-4 fill-current" />
              {tool.rating}
            </div>
          </div>
          <h1 className="text-4xl font-bold">{tool.name}</h1>
          <p className="text-xl text-muted-foreground">
            {tool.tagline}
          </p>
          {tool.affiliateLink && (
            <a 
              href={tool.affiliateLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg", className: "h-12 px-8" })}
            >
              Coba {tool.name} <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Tentang {tool.name}</h2>
        <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap">
          {tool.description}
        </div>
      </div>
    </div>
  )
}

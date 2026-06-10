import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const collection = await prisma.toolCollection.findUnique({
    where: { slug },
  })

  if (!collection) {
    return { title: "Collection Not Found" }
  }

  return {
    title: collection.name,
    description: collection.description ?? `Browse the ${collection.name} collection of AI tools.`,
    alternates: { canonical: `/collections/${slug}` },
  }
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params

  const collection = await prisma.toolCollection.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          tool: {
            include: {
              _count: {
                select: { bookmarks: true, reviews: true },
              },
            },
          },
        },
      },
    },
  })

  if (!collection) {
    notFound()
  }

  // Only allow viewing public collections unless we want to add auth later
  if (!collection.isPublic) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Collection Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {collection.color && (
            <div
              className="h-16 w-16 rounded-xl"
              style={{ backgroundColor: collection.color }}
            />
          )}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight">{collection.name}</h1>
              {collection.isFeatured && <Badge>Featured</Badge>}
            </div>
            {collection.description && (
              <p className="text-lg text-muted-foreground">{collection.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {collection.items.length} tools in this collection
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      {collection.items.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 py-20 text-center">
          <p className="text-muted-foreground">This collection is empty.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collection.items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="relative">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Badge variant="secondary">{item.tool.category}</Badge>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    {item.tool.rating}
                  </div>
                </div>
                <CardTitle className="leading-tight">{item.tool.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.tool.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-3">
                <Badge variant="outline">{item.tool.pricing}</Badge>
                <Link
                  href={`/ai-tools/${item.tool.slug}`}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  View Details
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
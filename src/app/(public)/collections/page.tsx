import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "AI Tools Collections",
  description: "Browse curated collections of AI tools by category and use case.",
  alternates: { canonical: "/collections" },
}

export default async function CollectionsPage() {
  const collections = await prisma.toolCollection.findMany({
    where: { isPublic: true },
    include: {
      _count: {
        select: { items: true },
      },
      items: {
        take: 4,
        orderBy: { order: "asc" as const },
        include: {
          tool: {
            select: {
              id: true,
              name: true,
              slug: true,
              tagline: true,
              logo: true,
              category: true,
              pricing: true,
              rating: true,
            },
          },
        },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { updatedAt: "desc" },
    ],
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">AI Tools Collections</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse curated collections of AI tools organized by category and use case.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 py-20 text-center">
          <p className="text-muted-foreground">No public collections available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card key={collection.id} className="flex flex-col overflow-hidden">
              <div
                className="h-2 w-full"
                style={{ backgroundColor: collection.color || "#3b82f6" }}
              />
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{collection.name}</CardTitle>
                    {collection.description && (
                      <CardDescription className="line-clamp-2">
                        {collection.description}
                      </CardDescription>
                    )}
                  </div>
                  {collection.isFeatured && (
                    <Badge variant="default" className="shrink-0">Featured</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* Preview of tools in collection */}
                <div className="space-y-2">
                  {collection.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/ai-tools/${item.tool.slug}`}
                      className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2 transition-colors hover:bg-muted"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                        {item.tool.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.tool.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.tool.tagline}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Show more indicator if needed */}
                {collection._count.items > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{collection._count.items - 4} more tools
                  </p>
                )}

                {/* View full collection link */}
                <Link
                  href={`/collections/${collection.slug}`}
                  className="block w-full text-center rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  View Full Collection
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
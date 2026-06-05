import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  createCollectionAction,
  deleteCollectionAction,
  updateCollectionAction,
  addToolToCollectionAction,
  removeToolFromCollectionAction,
} from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminCollectionsPage() {
  const collections = await prisma.toolCollection.findMany({
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const tools = await prisma.aITool.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collections Manager</h1>
          <p className="text-muted-foreground">Kelola koleksi tools AI.</p>
        </div>
      </div>

      {/* Create Collection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCollectionAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                id="name"
                name="name"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Collection name"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label htmlFor="slug" className="text-sm font-medium">Slug (optional)</label>
              <input
                id="slug"
                name="slug"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="auto-generated-from-name"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label htmlFor="color" className="text-sm font-medium">Color</label>
              <input
                id="color"
                name="color"
                type="color"
                className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="#3b82f6"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPublic" className="h-4 w-4 rounded border-input" />
                Public
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" className="h-4 w-4 rounded border-input" />
                Featured
              </label>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      {/* Collections List */}
      <div className="space-y-4">
        {collections.map((collection) => (
          <Card key={collection.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {collection.color && (
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: collection.color }}
                      />
                    )}
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <Badge variant="outline">/{collection.slug}</Badge>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground">{collection.description}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    {collection.isPublic && <Badge>Public</Badge>}
                    {collection.isFeatured && <Badge variant="default">Featured</Badge>}
                    <Badge variant="secondary">{collection._count.items} tools</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium"
                    target="_blank"
                  >
                    View
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Collection Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Tools in this collection</h4>
                  <div className="flex gap-2">
                    {/* Add tool dropdown */}
                    <form action={addToolToCollectionAction} className="flex gap-2">
                      <input type="hidden" name="collectionId" value={collection.id} />
                      <select
                        name="toolId"
                        required
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        defaultValue=""
                      >
                        <option value="" disabled>Add tool...</option>
                        {tools.map((tool) => (
                          <option key={tool.id} value={tool.id}>
                            {tool.name}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="outline">
                        Add
                      </Button>
                    </form>
                  </div>
                </div>

                {/* List items in collection */}
                <CollectionItems collectionId={collection.id} />
              </div>

              {/* Delete form */}
              <div className="mt-4 flex justify-end border-t pt-4">
                <form action={deleteCollectionAction}>
                  <input type="hidden" name="id" value={collection.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Delete Collection
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

async function CollectionItems({ collectionId }: { collectionId: string }) {
  const items = await prisma.toolCollectionItem.findMany({
    where: { collectionId },
    include: {
      tool: {
        select: { id: true, name: true, slug: true, logo: true },
      },
    },
    orderBy: { order: "asc" },
  })

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No tools in this collection yet.</p>
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">#{item.order + 1}</span>
            <span className="font-medium text-sm">{item.tool.name}</span>
            <span className="text-xs text-muted-foreground">/{item.tool.slug}</span>
          </div>
          <form action={removeToolFromCollectionAction}>
            <input type="hidden" name="collectionId" value={collectionId} />
            <input type="hidden" name="toolId" value={item.tool.id} />
            <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-destructive">
              Remove
            </Button>
          </form>
        </div>
      ))}
    </div>
  )
}
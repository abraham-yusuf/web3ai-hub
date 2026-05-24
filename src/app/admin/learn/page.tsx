import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteLearnPageAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminLearnPage() {
  const tracks = await prisma.learnTrack.findMany({
    orderBy: { order: "asc" },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          pages: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learn Management</h1>
          <p className="text-muted-foreground">Manage your learning tracks, sections, and pages.</p>
        </div>
        <Button>
          <Link href="/admin/learn/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> New Page
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        {tracks.map((track) => (
          <div key={track.id} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-semibold">{track.title} <span className="text-sm font-normal text-muted-foreground">({track.slug})</span></h2>
            </div>
            
            <div className="space-y-6">
              {track.sections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <h3 className="text-lg font-medium text-primary">{section.title}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {section.pages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between rounded-md border p-3 bg-background">
                        <div className="overflow-hidden">
                          <p className="truncate font-medium">{page.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{page.slug}</p>
                        </div>
                        <div className="flex gap-1 ml-2 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/admin/learn/${page.id}/edit`} className="flex items-center justify-center">
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <form action={deleteLearnPageAction}>
                            <input type="hidden" name="id" value={page.id} />
                            <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    ))}
                    {section.pages.length === 0 && (
                      <p className="text-sm text-muted-foreground italic col-span-full">No pages in this section.</p>
                    )}
                  </div>
                </div>
              ))}
              {track.sections.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No sections in this track.</p>
              )}
            </div>
          </div>
        ))}
        {tracks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No tracks found. Please run migration or add a track via DB.</p>
          </div>
        )}
      </div>
    </div>
  )
}

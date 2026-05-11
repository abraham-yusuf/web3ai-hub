import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { createLearnPageAction } from "../actions"

export default async function NewLearnPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; content?: string }>
}) {
  const params = await searchParams
  const initialTitle = params.title || ""
  const initialContent = params.content || ""

  const tracks = await prisma.learnTrack.findMany({
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Learn Page</h1>
        <p className="text-muted-foreground">Tambahkan materi pembelajaran baru.</p>
      </div>

      <form action={createLearnPageAction} className="space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={initialTitle} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (e.g. web3-basics/intro)</Label>
          <Input id="slug" name="slug" required placeholder="track-slug/page-slug" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sectionId">Section</Label>
            <select
              id="sectionId"
              name="sectionId"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Section</option>
              {tracks.map((track) => (
                <optgroup key={track.id} label={track.title}>
                  {track.sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input id="order" name="order" type="number" defaultValue="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">MDX Content</Label>
          <textarea
            id="content"
            name="content"
            required
            defaultValue={initialContent}
            className="min-h-[400px] w-full rounded-md border bg-background p-3 font-mono text-sm"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">Simpan Materi</Button>
          <Button variant="outline">
            <Link href="/admin/learn">Batal</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}

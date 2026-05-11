import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { updateLearnPageAction } from "../../actions"

export default async function EditLearnPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const page = await prisma.learnPage.findUnique({
    where: { id },
    include: { section: true },
  })

  if (!page) {
    notFound()
  }

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
        <h1 className="text-3xl font-bold">Edit Learn Page</h1>
        <p className="text-muted-foreground">Update materi pembelajaran.</p>
      </div>

      <form action={updateLearnPageAction} className="space-y-4 rounded-lg border p-6">
        <input type="hidden" name="id" value={page.id} />
        
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={page.title} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (e.g. web3-basics/intro)</Label>
          <Input id="slug" name="slug" required defaultValue={page.slug} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sectionId">Section</Label>
            <select
              id="sectionId"
              name="sectionId"
              required
              defaultValue={page.sectionId}
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
            <Input id="order" name="order" type="number" defaultValue={page.order.toString()} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">MDX Content</Label>
          <textarea
            id="content"
            name="content"
            required
            defaultValue={page.content}
            className="min-h-[400px] w-full rounded-md border bg-background p-3 font-mono text-sm"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">Update Materi</Button>
          <Button variant="outline">
            <Link href="/admin/learn">Batal</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}

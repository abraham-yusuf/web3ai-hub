import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateToolAction } from "../../actions"

interface EditToolPageProps {
  params: Promise<{ id: string }>
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const { id } = await params
  const tool = await prisma.aITool.findUnique({ where: { id } })
  if (!tool) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit AI Tool</h1>
      <form action={updateToolAction} className="space-y-4 rounded-lg border p-6">
        <input type="hidden" name="id" value={tool.id} />
        <input name="name" required defaultValue={tool.name} className="w-full rounded-md border bg-background px-3 py-2" />
        <input name="slug" defaultValue={tool.slug} className="w-full rounded-md border bg-background px-3 py-2" />
        <input name="tagline" defaultValue={tool.tagline ?? ""} className="w-full rounded-md border bg-background px-3 py-2" />
        <textarea name="description" defaultValue={tool.description} className="min-h-28 w-full rounded-md border bg-background p-3 text-sm" />
        <div className="grid gap-3 md:grid-cols-3">
          <input name="category" defaultValue={tool.category} className="rounded-md border bg-background px-3 py-2" />
          <input name="pricing" defaultValue={tool.pricing} className="rounded-md border bg-background px-3 py-2" />
          <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={tool.rating} className="rounded-md border bg-background px-3 py-2" />
        </div>
        <input name="affiliateLink" defaultValue={tool.affiliateLink ?? ""} className="w-full rounded-md border bg-background px-3 py-2" />
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={tool.featured} /> Featured</label>
        <button type="submit" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Update</button>
      </form>
    </div>
  )
}

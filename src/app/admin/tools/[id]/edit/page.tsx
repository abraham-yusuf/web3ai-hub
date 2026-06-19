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

  const sponsoredUntilStr = tool.sponsoredUntil
    ? tool.sponsoredUntil.toISOString().split("T")[0]
    : ""

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit AI Tool</h1>
      <form action={updateToolAction} className="space-y-4 rounded-lg border p-6">
        <input type="hidden" name="id" value={tool.id} />

        <div className="space-y-1">
          <label className="text-sm font-medium">Name</label>
          <input name="name" required defaultValue={tool.name} className="w-full rounded-md border bg-background px-3 py-2" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Slug</label>
          <input name="slug" defaultValue={tool.slug} className="w-full rounded-md border bg-background px-3 py-2" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Tagline</label>
          <input name="tagline" defaultValue={tool.tagline ?? ""} className="w-full rounded-md border bg-background px-3 py-2" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" defaultValue={tool.description} className="min-h-28 w-full rounded-md border bg-background p-3 text-sm" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <input name="category" defaultValue={tool.category} className="rounded-md border bg-background px-3 py-2" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Pricing</label>
            <input name="pricing" defaultValue={tool.pricing} className="rounded-md border bg-background px-3 py-2" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Rating</label>
            <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={tool.rating} className="rounded-md border bg-background px-3 py-2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Affiliate Link</label>
          <input name="affiliateLink" defaultValue={tool.affiliateLink ?? ""} className="w-full rounded-md border bg-background px-3 py-2" placeholder="https://tool.com/?ref=web3ai" />
        </div>

        {/* Badges */}
        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={tool.featured} className="rounded" />
            Featured
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="sponsored" defaultChecked={tool.sponsored} className="rounded" />
            Sponsored
          </label>
        </div>

        {/* Sponsored Details */}
        <div className="rounded-lg border border-dashed p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Sponsored Details (optional)</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Package</label>
              <select
                name="sponsoredPackage"
                defaultValue={tool.sponsoredPackage ?? ""}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                <option value="basic">Basic ($99/mo)</option>
                <option value="premium">Premium ($249/mo)</option>
                <option value="enterprise">Enterprise ($499/mo)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Expires</label>
              <input
                type="date"
                name="sponsoredUntil"
                defaultValue={sponsoredUntilStr}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Internal Note</label>
              <input
                name="sponsoredNote"
                defaultValue={tool.sponsoredNote ?? ""}
                placeholder="e.g. Deal with OpenAI"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Update
        </button>
      </form>
    </div>
  )
}

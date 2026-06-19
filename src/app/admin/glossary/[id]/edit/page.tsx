import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { updateGlossaryEntryAction, deleteGlossaryEntryAction } from "../../actions"
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button"

interface EditGlossaryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditGlossaryPage({ params }: EditGlossaryPageProps) {
  const { id } = await params

  const entry = await prisma.glossaryEntry.findUnique({ where: { id } })
  if (!entry) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/glossary" className="text-muted-foreground hover:text-foreground text-sm">
              ← Glossary
            </Link>
            <h1 className="text-2xl font-bold">Edit Entry</h1>
            {entry.isPublished ? (
              <span className="inline-flex h-5 items-center justify-center rounded-4xl border border-transparent bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                Published
              </span>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">/{entry.slug}</p>
        </div>
      </div>

      {/* Main Edit Form */}
      <form action={updateGlossaryEntryAction} className="space-y-4 rounded-lg border p-6">
        <input type="hidden" name="id" value={entry.id} />

        <div className="space-y-2">
          <Label htmlFor="term">Term *</Label>
          <Input id="term" name="term" required defaultValue={entry.term} />
          <p className="text-xs text-muted-foreground">
            Slug akan dibuat otomatis dari term (lowercase, spasi jadi hyphen).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="definition">Definition *</Label>
          <textarea
            id="definition"
            name="definition"
            required
            defaultValue={entry.definition}
            className="min-h-32 w-full rounded-md border bg-background p-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="example">Example (opsional)</Label>
          <textarea
            id="example"
            name="example"
            defaultValue={entry.example ?? ""}
            placeholder="Contoh penggunaan istilah ini dalam konteks Web3..."
            className="min-h-24 w-full rounded-md border bg-background p-3 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue={entry.category ?? ""} placeholder="e.g. DeFi, NFT" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              name="language"
              defaultValue={entry.language}
              className="w-full rounded-md border bg-background p-2 text-sm"
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" name="tags" defaultValue={entry.tags.join(", ")} placeholder="e.g. defi, yield" />
          <p className="text-xs text-muted-foreground">Pisahkan dengan koma. Contoh: defi, yield, lending</p>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={entry.isPublished} />
            Publish
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Save Changes</Button>
          <Link href="/admin/glossary">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
        </div>
      </form>

      {/* Delete Section */}
      <div className="space-y-3 rounded-lg border border-destructive/50 p-6">
        <div>
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Menghapus entry tidak dapat dibatalkan.
          </p>
        </div>
        <form action={deleteGlossaryEntryAction}>
          <input type="hidden" name="id" value={entry.id} />
          <ConfirmDeleteButton
            message="Yakin ingin menghapus glossary entry ini? Tindakan ini tidak dapat dibatalkan."
            size="default"
          >
            Delete Entry
          </ConfirmDeleteButton>
        </form>
      </div>
    </div>
  )
}
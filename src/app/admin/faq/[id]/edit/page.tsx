import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { updateFaqEntryAction, deleteFaqEntryAction } from "../../actions"
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button"

const CATEGORIES = ["general", "billing", "technical", "web3", "ai-tools", "account"]

interface EditFaqPageProps {
  params: Promise<{ id: string }>
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params

  const entry = await prisma.faq.findUnique({ where: { id } })
  if (!entry) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/faq" className="text-muted-foreground hover:text-foreground text-sm">
              ← FAQ
            </Link>
            <h1 className="text-2xl font-bold">Edit FAQ</h1>
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
      <form action={updateFaqEntryAction} className="space-y-4 rounded-lg border p-6">
        <input type="hidden" name="id" value={entry.id} />

        <div className="space-y-2">
          <Label htmlFor="question">Question *</Label>
          <textarea
            id="question"
            name="question"
            required
            defaultValue={entry.question}
            className="min-h-20 w-full rounded-md border bg-background p-3 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Slug akan dibuat otomatis dari question (lowercase, spasi jadi hyphen, max 80 chars).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer">Answer *</Label>
          <textarea
            id="answer"
            name="answer"
            required
            defaultValue={entry.answer}
            className="min-h-32 w-full rounded-md border bg-background p-3 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={entry.category ?? ""}
              className="w-full rounded-md border bg-background p-2 text-sm"
            >
              <option value="">— None —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
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
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            name="order"
            type="number"
            min="0"
            defaultValue={String(entry.order)}
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">Lower numbers appear first within the same category.</p>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={entry.isPublished} />
            Publish
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Save Changes</Button>
          <Link href="/admin/faq">
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
            Menghapus FAQ tidak dapat dibatalkan.
          </p>
        </div>
        <form action={deleteFaqEntryAction}>
          <input type="hidden" name="id" value={entry.id} />
          <ConfirmDeleteButton
            message="Yakin ingin menghapus FAQ ini? Tindakan ini tidak dapat dibatalkan."
            size="default"
          >
            Delete FAQ
          </ConfirmDeleteButton>
        </form>
      </div>
    </div>
  )
}
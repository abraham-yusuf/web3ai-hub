import { createToolAction } from "../actions"

export default function NewToolPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Tambah AI Tool</h1>
      <form action={createToolAction} className="space-y-4 rounded-lg border p-6">
        <input name="name" required placeholder="Nama tool" className="w-full rounded-md border bg-background px-3 py-2" />
        <input name="slug" placeholder="slug-tool" className="w-full rounded-md border bg-background px-3 py-2" />
        <input name="tagline" placeholder="Tagline" className="w-full rounded-md border bg-background px-3 py-2" />
        <textarea name="description" placeholder="Deskripsi" className="min-h-28 w-full rounded-md border bg-background p-3 text-sm" />
        <div className="grid gap-3 md:grid-cols-3">
          <input name="category" placeholder="Category" className="rounded-md border bg-background px-3 py-2" />
          <input name="pricing" placeholder="Freemium" className="rounded-md border bg-background px-3 py-2" />
          <input name="rating" type="number" min="0" max="5" step="0.1" placeholder="4.5" className="rounded-md border bg-background px-3 py-2" />
        </div>
        <input name="affiliateLink" placeholder="https://..." className="w-full rounded-md border bg-background px-3 py-2" />
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <button type="submit" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Simpan</button>
      </form>
    </div>
  )
}

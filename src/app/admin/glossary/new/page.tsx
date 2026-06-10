import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createGlossaryEntryAction } from "../actions"
import Link from "next/link"

export default async function NewGlossaryEntryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin/glossary" className="text-muted-foreground hover:text-foreground text-sm">
            ← Glossary
          </Link>
        </div>
        <h1 className="text-3xl font-bold">New Glossary Entry</h1>
        <p className="text-muted-foreground">Tambah istilah baru ke glossary.</p>
      </div>

      <form action={createGlossaryEntryAction} className="space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="term">Term *</Label>
          <Input id="term" name="term" required placeholder="e.g. DeFi, NFT, Layer 2" />
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
            placeholder="Jelaskan istilah ini secara singkat dan jelas..."
            className="min-h-32 w-full rounded-md border bg-background p-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="example">Example (opsional)</Label>
          <textarea
            id="example"
            name="example"
            placeholder="Contoh penggunaan istilah ini dalam konteks Web3..."
            className="min-h-24 w-full rounded-md border bg-background p-3 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" placeholder="e.g. DeFi, NFT, Layer 2, Security" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              name="language"
              defaultValue="id"
              className="w-full rounded-md border bg-background p-2 text-sm"
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" name="tags" placeholder="e.g. defi, yield, lending" />
          <p className="text-xs text-muted-foreground">Pisahkan dengan koma. Contoh: defi, yield, lending</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" />
          Publish sekarang (langsung terlihat publik)
        </label>

        <div className="flex gap-3">
          <Button type="submit">Simpan Entry</Button>
          <Link href="/admin/glossary">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
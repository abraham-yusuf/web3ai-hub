import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createFaqEntryAction } from "../actions"
import Link from "next/link"

const CATEGORIES = ["general", "billing", "technical", "web3", "ai-tools", "account"]

export default async function NewFaqPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin/faq" className="text-muted-foreground hover:text-foreground text-sm">
            ← FAQ
          </Link>
        </div>
        <h1 className="text-3xl font-bold">New FAQ</h1>
        <p className="text-muted-foreground">Tambah FAQ baru.</p>
      </div>

      <form action={createFaqEntryAction} className="space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="question">Question *</Label>
          <textarea
            id="question"
            name="question"
            required
            placeholder="Apa itu DeFi?"
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
            placeholder="DeFi adalah singkatan dari Decentralized Finance..."
            className="min-h-32 w-full rounded-md border bg-background p-3 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
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
              defaultValue="id"
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
            defaultValue="0"
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">Lower numbers appear first within the same category.</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" />
          Publish sekarang (langsung terlihat publik)
        </label>

        <div className="flex gap-3">
          <Button type="submit">Simpan FAQ</Button>
          <Link href="/admin/faq">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SlugField } from "@/components/admin/slug-field"
import { createPostAction } from "../actions"

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; content?: string }>
}) {
  const params = await searchParams
  const initialTitle = typeof params.title === "string" ? params.title : ""
  const initialContent = typeof params.content === "string" ? params.content : ""

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Post</h1>
        <p className="text-muted-foreground">Buat draft/publish post baru dari dashboard.</p>
      </div>

      <form action={createPostAction} className="space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={initialTitle} />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <SlugField initialTitle={initialTitle} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <textarea id="excerpt" name="excerpt" className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" placeholder="web3" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" placeholder="web3, ai, tutorial" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledFor">Schedule publish</Label>
          <Input id="scheduledFor" name="scheduledFor" type="datetime-local" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">MDX Content</Label>
          <textarea
            id="content"
            name="content"
            required
            defaultValue={initialContent}
            className="min-h-[320px] w-full rounded-md border bg-background p-3 font-mono text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" />
          Publish sekarang
        </label>

        <Button type="submit">Simpan Post</Button>
      </form>
    </div>
  )
}

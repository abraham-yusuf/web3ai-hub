import { Button } from "@/components/ui/button"
import { SlugField } from "@/components/admin/slug-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { updatePostAction } from "../../actions"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">Update konten, status publish, dan schedule post.</p>
        </div>
        <Link href={`/admin/posts/preview/${post.id}`} className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">Preview</Link>
      </div>

      <form action={updatePostAction} className="space-y-4 rounded-lg border p-6">
        <input type="hidden" name="id" value={post.id} />

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={post.title} required />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <SlugField initialSlug={post.slug} postId={post.id} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <textarea id="excerpt" name="excerpt" defaultValue={post.excerpt ?? ""} className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue={post.category} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" defaultValue={post.tags.join(", ")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledFor">Schedule publish</Label>
          <Input
            id="scheduledFor"
            name="scheduledFor"
            type="datetime-local"
            defaultValue={post.scheduledFor ? post.scheduledFor.toISOString().slice(0, 16) : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">MDX Content</Label>
          <textarea
            id="content"
            name="content"
            defaultValue={post.content}
            required
            className="min-h-[320px] w-full rounded-md border bg-background p-3 font-mono text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={post.published} />
          Publish sekarang
        </label>

        <Button type="submit">Update Post</Button>
      </form>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SlugField } from "@/components/admin/slug-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { updatePostAction, addCoAuthorAction, removeCoAuthorAction, submitForReviewAction, approvePostAction, publishPostAction, archivePostAction } from "../../actions"
import { auth } from "@/auth"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING_REVIEW: { label: "Pending Review", variant: "outline" },
  APPROVED: { label: "Approved", variant: "default" },
  PUBLISHED: { label: "Published", variant: "default" },
  ARCHIVED: { label: "Archived", variant: "destructive" },
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params

  const [post, session] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, username: true } },
        coAuthors: {
          include: { user: { select: { id: true, name: true, email: true, username: true } } },
        },
        revisions: {
          orderBy: { version: "desc" },
          take: 3,
          include: { author: { select: { name: true } } },
        },
      },
    }),
    auth(),
  ])

  if (!post) notFound()

  const canModerate = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"
  const isOwner = session?.user?.id === post.authorId
  const statusInfo = STATUS_LABELS[post.status] ?? { label: post.status, variant: "secondary" }

  // Get all users for co-author selection (excluding owner and existing co-authors)
  const existingUserIds = [post.authorId, ...post.coAuthors.map(c => c.userId)]
  const availableUsers = await prisma.user.findMany({
    where: { id: { notIn: existingUserIds } },
    select: { id: true, name: true, email: true, username: true, role: true },
    take: 20,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/posts" className="text-muted-foreground hover:text-foreground text-sm">← Posts</Link>
            <h1 className="text-2xl font-bold">Edit Post</h1>
            <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {post.wordCount.toLocaleString()} words · ~{post.readingTime} min read ·{" "}
            <Link href={`/admin/posts/${post.id}/revisions`} className="underline">
              {post.revisions.length} revision{post.revisions.length !== 1 ? "s" : ""}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/posts/preview/${post.id}`} className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
            Preview
          </Link>
          <Link href={`/admin/posts/${post.id}/revisions`} className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
            History
          </Link>
        </div>
      </div>

      {/* Status Action Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
        <span className="text-sm font-medium">Workflow:</span>
        {post.status === "DRAFT" && (
          <form action={submitForReviewAction}>
            <input type="hidden" name="id" value={post.id} />
            <Button type="submit" size="sm" variant="outline">Submit for Review</Button>
          </form>
        )}
        {post.status === "PENDING_REVIEW" && canModerate && (
          <form action={approvePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <Button type="submit" size="sm">Approve</Button>
          </form>
        )}
        {(post.status === "APPROVED" || post.status === "PENDING_REVIEW") && canModerate && (
          <form action={publishPostAction}>
            <input type="hidden" name="id" value={post.id} />
            <Button type="submit" size="sm" variant="default">Publish Now</Button>
          </form>
        )}
        {post.status !== "ARCHIVED" && (
          <form action={archivePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <Button type="submit" size="sm" variant="destructive" className="ml-auto">Archive</Button>
          </form>
        )}
        {post.status === "ARCHIVED" && canModerate && (
          <form action={publishPostAction}>
            <input type="hidden" name="id" value={post.id} />
            <Button type="submit" size="sm">Unarchive / Republish</Button>
          </form>
        )}
      </div>

      {/* Main Edit Form */}
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={post.status}
              className="w-full rounded-md border bg-background p-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Schedule Publish</Label>
            <Input
              id="scheduledFor"
              name="scheduledFor"
              type="datetime-local"
              defaultValue={post.scheduledFor ? post.scheduledFor.toISOString().slice(0, 16) : ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">MDX Content</Label>
          <textarea
            id="content"
            name="content"
            defaultValue={post.content}
            required
            className="min-h-[400px] w-full rounded-md border bg-background p-3 font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="revisionReason">Revision Note (what changed?)</Label>
          <Input
            id="revisionReason"
            name="revisionReason"
            placeholder="e.g. Fixed typo in intro, Added new section about DeFi..."
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            This note will be saved in the revision history for tracking changes.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={post.published} />
            Publish
          </label>
          <span className="text-xs text-muted-foreground">
            Primary author: {post.author.name ?? post.author.username ?? post.author.email?.split("@")[0] ?? "?"}
          </span>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>

      {/* Co-Authors Section */}
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Co-Authors</h2>
            <p className="text-sm text-muted-foreground">Add collaborators to this post</p>
          </div>
        </div>

        {/* Current co-authors */}
        {post.coAuthors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Current:</p>
            {post.coAuthors.map((ca) => (
              <div key={ca.id} className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {ca.user.name ?? ca.user.username ?? ca.user.email?.split("@")[0]}
                  </span>
                  <Badge variant="outline" className="text-xs">{ca.role}</Badge>
                </div>
                <form action={removeCoAuthorAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="userId" value={ca.userId} />
                  <Button type="submit" variant="ghost" size="sm" className="text-xs text-destructive">
                    Remove
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* Add co-author */}
        {canModerate && availableUsers.length > 0 && (
          <form action={addCoAuthorAction} className="flex items-end gap-2">
            <input type="hidden" name="postId" value={post.id} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="userId" className="text-xs">Add collaborator</Label>
              <select
                id="userId"
                name="userId"
                className="w-full rounded-md border bg-background p-2 text-sm"
                defaultValue=""
              >
                <option value="">Select user...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name ?? u.username ?? u.email?.split("@")[0]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="coAuthorRole" className="text-xs">Role</Label>
              <select
                id="coAuthorRole"
                name="coAuthorRole"
                className="rounded-md border bg-background p-2 text-sm"
                defaultValue="co-author"
              >
                <option value="co-author">Co-Author</option>
                <option value="editor">Editor</option>
                <option value="reviewer">Reviewer</option>
              </select>
            </div>
            <Button type="submit" size="sm">Add</Button>
          </form>
        )}

        {post.coAuthors.length === 0 && availableUsers.length === 0 && (
          <p className="text-sm text-muted-foreground">No other users available to add as co-author.</p>
        )}
      </div>

      {/* Recent Revisions */}
      {post.revisions.length > 0 && (
        <div className="space-y-3 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Revisions</h2>
            <Link href={`/admin/posts/${post.id}/revisions`} className="text-sm text-primary underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {post.revisions.map((rev) => (
              <div key={rev.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div>
                  <span className="font-medium">v{rev.version}</span>
                  <span className="ml-2 text-muted-foreground">{rev.reason ?? "No description"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {rev.author.name} · {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
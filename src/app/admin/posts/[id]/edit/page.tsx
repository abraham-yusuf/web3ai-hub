import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SlugField } from "@/components/admin/slug-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  updatePostAction,
  submitForReviewAction,
  approvePostAction,
  rejectPostAction,
  publishPostAction,
  revertToRevisionAction,
} from "../../actions"
import { auth } from "@/auth"
import { PostStatus } from "@prisma/client"

const STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
}

const STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT: "border border-muted text-muted-foreground",
  IN_REVIEW: "border border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  APPROVED: "border border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  PUBLISHED: "border border-primary bg-primary/10 text-primary",
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ review?: string; status?: string }>
}

export default async function EditPostPage({ params, searchParams }: Props) {
  const { id } = await params
  const { review: showReview, status: urlStatus } = await searchParams
  const session = await auth()
  const isEditorOrAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { name: true } },
      rejectedBy: { select: { name: true } },
      coAuthors: { include: { user: { select: { id: true, name: true, email: true } } } },
      revisions: {
        orderBy: { version: "desc" },
        select: { id: true, version: true, title: true, authorId: true, createdAt: true },
      },
    },
  })

  if (!post) notFound()

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })

  // Show review panel if ?review=1 or status param from redirect
  const showReviewPanel = showReview === "1" || !!urlStatus

  return (
    <div className="space-y-6">
      {/* ── Status Banner ───────────────────────────────────────── */}
      <div className={`rounded-lg border p-4 ${STATUS_COLORS[post.status]}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                <Badge variant="outline">{STATUS_LABELS[post.status]}</Badge>
                <span className="text-xs opacity-70">v{post.version}</span>
                <span className="text-xs opacity-70">·</span>
                <span className="text-xs opacity-70">{post.category}</span>
                <span className="text-xs opacity-70">·</span>
                <span className="text-xs opacity-70">{post.viewCount} views</span>
                <span className="text-xs opacity-70">·</span>
                <span className="text-xs opacity-70">{post.readTimeMinutes ?? 0} min read</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {urlStatus && (
              <span className="text-sm font-medium animate-in fade-in">
                ✓ Status updated to {urlStatus.replace("_", " ")}
              </span>
            )}

            {!isEditorOrAdmin && post.status === "DRAFT" && (
              <form action={submitForReviewAction}>
                <input type="hidden" name="postId" value={post.id} />
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Submit for Review
                </Button>
              </form>
            )}

            {isEditorOrAdmin && post.status === "IN_REVIEW" && (
              <>
                <form action={approvePostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                    ✓ Approve
                  </Button>
                </form>
                <Link
                  href={`/admin/posts/${post.id}/edit?review=1`}
                  className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium"
                >
                  ✗ Review & Reject
                </Link>
              </>
            )}

            {isEditorOrAdmin && post.status === "APPROVED" && (
              <form action={publishPostAction}>
                <input type="hidden" name="postId" value={post.id} />
                <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                  🚀 Publish Now
                </Button>
              </form>
            )}

            <Link
              href={`/admin/posts/preview/${post.id}`}
              className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium"
            >
              Preview
            </Link>
          </div>
        </div>

        {/* Reviewer notes banner */}
        {post.reviewerNotes && (
          <div className="mt-3 rounded-md bg-background/60 p-3 text-sm">
            <span className="font-medium">
              {post.approvedBy ? "✓ Approved" : post.rejectedBy ? "✗ Rejected" : "📝 Catatan Review"}:
            </span>{" "}
            {post.reviewerNotes}
            {post.rejectedBy && post.rejectedBy.name && (
              <span className="ml-1 text-xs opacity-70">— {post.rejectedBy.name}</span>
            )}
            {post.approvedBy && post.approvedBy.name && (
              <span className="ml-1 text-xs opacity-70">— {post.approvedBy.name}</span>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Main Form (2/3) ───────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
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
              <textarea
                id="excerpt"
                name="excerpt"
                defaultValue={post.excerpt ?? ""}
                className="min-h-24 w-full rounded-md border bg-background p-3 text-sm"
              />
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
              <Label htmlFor="scheduledFor">Schedule publish (optional)</Label>
              <Input
                id="scheduledFor"
                name="scheduledFor"
                type="datetime-local"
                defaultValue={
                  post.scheduledFor ? post.scheduledFor.toISOString().slice(0, 16) : ""
                }
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

            <div className="flex flex-wrap gap-2">
              <Button type="submit" name="action" value="save">
                💾 Save Changes
              </Button>
              {post.status === "DRAFT" && !isEditorOrAdmin && (
                <Button type="submit" name="action" value="submit_for_review" className="bg-blue-600 hover:bg-blue-700">
                  📤 Submit for Review
                </Button>
              )}
              {isEditorOrAdmin && (
                <Button type="submit" name="action" value="publish" className="bg-green-600 hover:bg-green-700">
                  🚀 Publish
                </Button>
              )}
            </div>
          </form>

          {/* ── Review Panel (for editors) ──────────────────────── */}
          {showReviewPanel && isEditorOrAdmin && post.status === "IN_REVIEW" && (
            <ReviewPanel postId={post.id} />
          )}
        </div>

        {/* ── Sidebar (1/3) ────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Meta info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author</span>
                <span>{post.author.name ?? post.author.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
              </div>
              {post.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
              {post.scheduledFor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled</span>
                  <span>{new Date(post.scheduledFor).toLocaleDateString()}</span>
                </div>
              )}
              {post.submittedForReviewAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{new Date(post.submittedForReviewAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Co-authors */}
          <CoAuthorCard
            postId={post.id}
            coAuthors={post.coAuthors}
            allUsers={allUsers}
            isEditorOrAdmin={isEditorOrAdmin}
          />

          {/* Revision history */}
          <RevisionHistoryCard postId={post.id} revisions={post.revisions} />
        </div>
      </div>
    </div>
  )
}

// ── Review Panel (Client-ish Server Component) ──────────────────────────────

function ReviewPanel({ postId }: { postId: string }) {
  return (
    <Card className="border-amber-300 dark:border-amber-700">
      <CardHeader>
        <CardTitle className="text-amber-600 dark:text-amber-400">📋 Review Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Approve untuk mempublish langsung, atau reject dengan catatan untuk dikembalikan ke
          author.
        </p>

        <form action={approvePostAction} className="space-y-3">
          <input type="hidden" name="postId" value={postId} />
          <div className="space-y-2">
            <Label htmlFor="approveNotes">Catatan (opsional)</Label>
            <textarea
              id="approveNotes"
              name="notes"
              className="w-full rounded-md border p-2 text-sm"
              rows={2}
              placeholder="Catatan opsional untuk approval..."
            />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            ✓ Approve
          </Button>
        </form>

        <Separator />

        <form action={rejectPostAction} className="space-y-3">
          <input type="hidden" name="postId" value={postId} />
          <div className="space-y-2">
            <Label htmlFor="rejectNotes">
              Catatan rejection <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="rejectNotes"
              name="notes"
              required
              className="w-full rounded-md border p-2 text-sm"
              rows={3}
              placeholder="Jelaskan kenapa post ditolak dan apa yang perlu diperbaiki..."
            />
          </div>
          <Button type="submit" variant="destructive" className="w-full">
            ✗ Reject & Return to Author
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Co-author Card ───────────────────────────────────────────────────────────

function CoAuthorCard({
  postId,
  coAuthors,
  allUsers,
  isEditorOrAdmin,
}: {
  postId: string
  coAuthors: Array<{ id: string; userId: string; role: string; user: { id: string; name: string | null; email: string } }>
  allUsers: Array<{ id: string; name: string | null; email: string; role: string }>
  isEditorOrAdmin: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">👥 Co-Authors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {coAuthors.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada co-author.</p>
        ) : (
          <ul className="space-y-2">
            {coAuthors.map((ca) => (
              <li key={ca.id} className="flex items-center justify-between text-sm">
                <span>
                  {ca.user.name ?? ca.user.email}
                  <span className="ml-1 text-xs text-muted-foreground">({ca.role})</span>
                </span>
                {isEditorOrAdmin && (
                  <form action={async () => {
                    "use server"
                    const { removeCoAuthorAction } = await import("../../actions")
                    // This is a simplified approach — in real scenario, pass formData
                  }}>
                    <input type="hidden" name="postId" value={postId} />
                    <input type="hidden" name="userId" value={ca.userId} />
                    <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs text-destructive">
                      Remove
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        {isEditorOrAdmin && (
          <AddCoAuthorForm postId={postId} allUsers={allUsers} />
        )}
      </CardContent>
    </Card>
  )
}

function AddCoAuthorForm({
  postId,
  allUsers,
}: {
  postId: string
  allUsers: Array<{ id: string; name: string | null; email: string; role: string }>
}) {
  // Note: simplified — in production, use a client component for the select
  return (
    <form
      action={async (formData) => {
        "use server"
        const { addCoAuthorAction } = await import("../../actions")
        const userId = formData.get("userId") as string
        const role = formData.get("role") as string
        await addCoAuthorAction(postId, userId, role)
      }}
      className="space-y-2"
    >
      <select
        name="userId"
        className="w-full rounded-md border p-2 text-sm"
        required
        defaultValue=""
      >
        <option value="" disabled>
          Add co-author...
        </option>
        {allUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name ?? u.email} ({u.role})
          </option>
        ))}
      </select>
      <select name="role" className="w-full rounded-md border p-2 text-sm" defaultValue="CONTRIBUTOR">
        <option value="PRIMARY">Primary</option>
        <option value="CO_AUTHOR">Co-author</option>
        <option value="CONTRIBUTOR">Contributor</option>
      </select>
      <Button type="submit" variant="outline" size="sm" className="w-full">
        + Add
      </Button>
    </form>
  )
}

// ── Revision History Card ────────────────────────────────────────────────────

function RevisionHistoryCard({
  postId,
  revisions,
}: {
  postId: string
  revisions: Array<{ id: string; version: number; title: string; authorId: string; createdAt: Date }>
}) {
  if (revisions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">📜 Revision History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Belum ada revisi.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">📜 Revision History</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {revisions.slice(0, 10).map((rev) => (
            <li key={rev.id} className="flex items-start justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">v{rev.version}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </p>
              </div>
              <form action={revertToRevisionAction}>
                <input type="hidden" name="postId" value={postId} />
                <input type="hidden" name="version" value={rev.version} />
                <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs">
                  Restore
                </Button>
              </form>
            </li>
          ))}
        </ul>
        {revisions.length > 10 && (
          <p className="mt-2 text-xs text-muted-foreground">
            +{revisions.length - 10} more revisions
          </p>
        )}
      </CardContent>
    </Card>
  )
}
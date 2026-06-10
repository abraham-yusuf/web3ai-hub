import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { deletePostAction } from "./actions"
import { submitForReviewAction, publishPostAction } from "./actions"
import { auth } from "@/auth"
import { PostStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
}

const STATUS_VARIANTS: Record<PostStatus, "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"> = {
  DRAFT: "outline",
  IN_REVIEW: "secondary",
  APPROVED: "default",
  PUBLISHED: "default",
}

const STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT: "text-muted-foreground",
  IN_REVIEW: "text-blue-600 dark:text-blue-400",
  APPROVED: "text-green-600 dark:text-green-400",
  PUBLISHED: "text-primary",
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminPostsPage({ searchParams }: Props) {
  const { status: statusFilter } = await searchParams
  const session = await auth()
  const isEditorOrAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"

  const where = statusFilter
    ? { status: statusFilter.toUpperCase() as PostStatus }
    : {}

  const posts = await prisma.post.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      approvedBy: { select: { name: true } },
      rejectedBy: { select: { name: true } },
      coAuthors: { include: { user: { select: { name: true, email: true } } } },
    },
  })

  const counts = await prisma.post.groupBy({
    by: ["status"],
    _count: { id: true },
  })

  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count.id])
  ) as Record<string, number>

  const total = Object.values(countMap).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Posts</h1>
          <p className="text-muted-foreground">
            {total} post &mdash; draft, review, approve, publish workflow.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Buat Post
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {(["all", "DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED"] as const).map((s) => {
          const label = s === "all" ? `All (${total})` : `${STATUS_LABELS[s]} (${countMap[s] ?? 0})`
          const isActive = s === "all" ? !statusFilter : statusFilter?.toUpperCase() === s
          return (
            <Link
              key={s}
              href={s === "all" ? "/admin/posts" : `/admin/posts?status=${s.toLowerCase()}`}
              className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Meta</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-medium">{post.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">/{post.slug}</span>
                    {post.featured && (
                      <Badge variant="default" className="text-xs">Featured</Badge>
                    )}
                    {post.scheduledFor && !post.published && (
                      <Badge variant="outline" className="text-xs">
                        Scheduled
                      </Badge>
                    )}
                  </div>
                  {post.reviewerNotes && post.status !== "PUBLISHED" && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 truncate max-w-xs">
                      📝 {post.reviewerNotes}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <Badge variant={STATUS_VARIANTS[post.status]}>
                      {STATUS_LABELS[post.status]}
                    </Badge>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        v{post.version}
                      </span>
                      {post.status === "IN_REVIEW" && post.submittedForReviewAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.submittedForReviewAt).toLocaleDateString()}
                        </span>
                      )}
                      {post.approvedBy && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ✓ by {post.approvedBy.name}
                        </span>
                      )}
                      {post.rejectedBy && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          ✗ by {post.rejectedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <p className="text-xs">{post.author.name ?? post.author.email}</p>
                  {post.coAuthors.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +{post.coAuthors.length} co-author{post.coAuthors.length > 1 ? "s" : ""}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>{post.category}</span>
                    <span>{post.viewCount} views</span>
                    <span>{post.readTimeMinutes ?? "—"} min read</span>
                  </div>
                </td>

                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium hover:bg-muted"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/posts/preview/${post.id}`}
                        className="inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium hover:bg-muted"
                      >
                        Preview
                      </Link>
                    </div>

                    {/* Workflow action buttons */}
                    <div className="flex flex-wrap gap-1">
                      {post.status === "DRAFT" && (
                        <form action={submitForReviewAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            Submit Review
                          </Button>
                        </form>
                      )}

                      {post.status === "APPROVED" && isEditorOrAdmin && (
                        <form action={publishPostAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <Button
                            type="submit"
                            size="sm"
                            className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                          >
                            Publish
                          </Button>
                        </form>
                      )}

                      {post.status === "IN_REVIEW" && isEditorOrAdmin && (
                        <Link
                          href={`/admin/posts/${post.id}/edit?review=1`}
                          className="inline-flex h-7 items-center rounded-md bg-blue-600 px-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Review
                        </Link>
                      )}
                    </div>

                    <form action={deletePostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {statusFilter
                    ? `Tidak ada post dengan status "${statusFilter}".`
                    : "Belum ada post di database."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
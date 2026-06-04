import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { deletePostAction } from "./actions"
import { submitForReviewAction, approvePostAction, publishPostAction, archivePostAction } from "./actions"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "success" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING_REVIEW: { label: "Pending Review", variant: "outline" },
  APPROVED: { label: "Approved", variant: "default" },
  PUBLISHED: { label: "Published", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "destructive" },
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? "ALL"
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10))
  const perPage = 20

  const where = statusFilter !== "ALL"
    ? { status: statusFilter as any }
    : undefined

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * perPage,
      take: perPage,
      include: {
        author: { select: { name: true, email: true, username: true } },
        _count: { select: { views: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)
  const session = await auth()
  const canModerate = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Posts</h1>
          <p className="text-muted-foreground">
            {total} post{total !== 1 ? "s" : ""}
            {statusFilter !== "ALL" ? ` · Filter: ${STATUS_LABELS[statusFilter]?.label ?? statusFilter}` : ""}
          </p>
        </div>
        <Link href="/admin/posts/new" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          + Buat Post
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"].map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/admin/posts" : `/admin/posts?status=${s}`}
            className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {s === "ALL" ? "Semua" : STATUS_LABELS[s]?.label ?? s}
          </Link>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {(["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] as const).map(async (s) => {
          const count = await prisma.post.count({ where: { status: s } })
          return (
            <div key={s} className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{STATUS_LABELS[s].label}</p>
            </div>
          )
        })}
      </div>

      {/* Posts Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Words</th>
              <th className="px-4 py-3 text-left">Views</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const status = STATUS_LABELS[post.status] ?? { label: post.status, variant: "secondary" as const }
              return (
                <tr key={post.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                    {post.scheduledFor && post.scheduledFor > new Date() && !post.published && (
                      <p className="text-xs text-amber-600">Scheduled: {post.scheduledFor.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant as any}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3">{post.category}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs">
                      {post.author.name ?? post.author.username ?? post.author.email?.split("@")[0] ?? "?"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs tabular-nums">{post.wordCount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs tabular-nums">{post._count.views}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-1">
                        <Link href={`/admin/posts/${post.id}/edit`} className="inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium">
                          Edit
                        </Link>
                        <Link href={`/admin/posts/preview/${post.id}`} className="inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium">
                          Preview
                        </Link>
                        <Link href={`/admin/posts/${post.id}/revisions`} className="inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium">
                          History
                        </Link>
                      </div>

                      {/* Status action buttons */}
                      {canModerate && (
                        <div className="flex flex-wrap gap-1">
                          {post.status === "DRAFT" && (
                            <form action={submitForReviewAction}>
                              <input type="hidden" name="id" value={post.id} />
                              <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">
                                Submit Review
                              </Button>
                            </form>
                          )}
                          {post.status === "PENDING_REVIEW" && (
                            <form action={approvePostAction}>
                              <input type="hidden" name="id" value={post.id} />
                              <Button type="submit" variant="default" size="sm" className="h-7 text-xs">
                                Approve
                              </Button>
                            </form>
                          )}
                          {(post.status === "APPROVED" || post.status === "PENDING_REVIEW") && (
                            <form action={publishPostAction}>
                              <input type="hidden" name="id" value={post.id} />
                              <Button type="submit" variant="default" size="sm" className="h-7 text-xs">
                                Publish
                              </Button>
                            </form>
                          )}
                          {post.status !== "ARCHIVED" && (
                            <form action={archivePostAction}>
                              <input type="hidden" name="id" value={post.id} />
                              <Button type="submit" variant="destructive" size="sm" className="h-7 text-xs">
                                Archive
                              </Button>
                            </form>
                          )}
                        </div>
                      )}

                      <form action={deletePostAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <Button type="submit" variant="destructive" size="sm" className="h-7 text-xs w-full">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  Belum ada post{statusFilter !== "ALL" ? ` dengan status "${STATUS_LABELS[statusFilter]?.label ?? statusFilter}"` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link href={`/admin/posts?status=${statusFilter}&page=${currentPage - 1}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/admin/posts?status=${statusFilter}&page=${currentPage + 1}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
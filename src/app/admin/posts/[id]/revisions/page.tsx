import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { restoreRevisionAction } from "../../actions"
import { auth } from "@/auth"

interface RevisionsPageProps {
  params: Promise<{ id: string }>
}

function diffLines(oldText: string, newText: string): { type: "same" | "added" | "removed"; text: string }[] {
  const oldLines = oldText.split("\n")
  const newLines = newText.split("\n")
  const result: { type: "same" | "added" | "removed"; text: string }[] = []

  // Simple line-by-line diff
  const maxLen = Math.max(oldLines.length, newLines.length)
  let i = 0, j = 0

  while (i < oldLines.length || j < newLines.length) {
    const o = oldLines[i]
    const n = newLines[j]

    if (o === n) {
      result.push({ type: "same", text: o ?? "" })
      i++; j++
    } else if (i < oldLines.length && !newLines.includes(o)) {
      result.push({ type: "removed", text: o })
      i++
    } else if (j < newLines.length && !oldLines.includes(n)) {
      result.push({ type: "added", text: n })
      j++
    } else {
      // Lines differ, show both
      if (i < oldLines.length) { result.push({ type: "removed", text: o }); i++ }
      if (j < newLines.length) { result.push({ type: "added", text: n }); j++ }
    }

    if (result.length > 500) break // cap for display
  }

  return result
}

export default async function PostRevisionsPage({ params }: RevisionsPageProps) {
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, status: true, content: true, wordCount: true },
  })
  if (!post) notFound()

  const revisions = await prisma.postRevision.findMany({
    where: { postId: id },
    orderBy: { version: "desc" },
    include: {
      author: { select: { name: true, username: true, email: true } },
    },
  })

  const session = await auth()
  const canRestore = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/posts" className="text-muted-foreground hover:text-foreground">← Posts</Link>
            <h1 className="text-2xl font-bold">Revision History</h1>
          </div>
          <p className="text-muted-foreground">{post.title}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/blog/${post.slug}`} className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
            View Live
          </Link>
          <Link href={`/admin/posts/${post.id}/edit`} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Edit Post
          </Link>
        </div>
      </div>

      {/* Current version info */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Version (Live)</p>
            <p className="text-sm text-muted-foreground">{post.wordCount} words · {post.status}</p>
          </div>
          <Badge variant="default">v{revisions.length + 1} (current)</Badge>
        </div>
      </div>

      {/* Revisions List */}
      {revisions.length === 0 ? (
        <div className="rounded-lg border p-10 text-center text-muted-foreground">
          No revisions yet. Revisions are created automatically when content changes.
        </div>
      ) : (
        <div className="space-y-6">
          {revisions.map((rev, idx) => {
            const prevRev = revisions[idx + 1] // Next older revision (since list is desc)
            const diff = prevRev ? diffLines(prevRev.content, rev.content) : null
            const addedLines = diff?.filter(d => d.type === "added").length ?? 0
            const removedLines = diff?.filter(d => d.type === "removed").length ?? 0

            return (
              <div key={rev.id} className="space-y-3 rounded-lg border">
                {/* Revision Header */}
                <div className="flex items-center justify-between border-b bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">v{rev.version}</Badge>
                    <div>
                      <p className="text-sm font-medium">{rev.reason ?? "No description"}</p>
                      <p className="text-xs text-muted-foreground">
                        By {rev.author.name ?? rev.author.username ?? rev.author.email?.split("@")[0] ?? "?"} ·{" "}
                        {new Date(rev.createdAt).toLocaleString()} · {rev.wordCount} words
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {diff && (
                      <span className="text-xs text-muted-foreground">
                        <span className="text-green-600">+{addedLines}</span> /{" "}
                        <span className="text-red-500">-{removedLines}</span> lines
                      </span>
                    )}
                    {canRestore && (
                      <form action={restoreRevisionAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="revisionId" value={rev.id} />
                        <input type="hidden" name="reason" value={`Restored to v${rev.version}`} />
                        <Button type="submit" variant="outline" size="sm">
                          Restore this version
                        </Button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Diff Preview */}
                {diff && diff.length > 0 && (
                  <div className="max-h-64 overflow-auto p-4 font-mono text-xs">
                    {diff.slice(0, 100).map((line, i) => (
                      <div
                        key={i}
                        className={`px-2 py-0.5 ${
                          line.type === "added"
                            ? "bg-green-950 text-green-300"
                            : line.type === "removed"
                            ? "bg-red-950 text-red-300"
                            : "text-muted-foreground"
                        }`}
                      >
                        {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
                        {line.text.slice(0, 120)}
                        {line.text.length > 120 ? "..." : ""}
                      </div>
                    ))}
                    {diff.length > 100 && (
                      <p className="px-2 py-1 text-muted-foreground">
                        ... and {diff.length - 100} more lines
                      </p>
                    )}
                  </div>
                )}

                {/* Metadata diff */}
                {prevRev && (prevRev.title !== rev.title || prevRev.excerpt !== rev.excerpt || prevRev.category !== rev.category) && (
                  <div className="border-t px-4 py-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Changes:</p>
                    {prevRev.title !== rev.title && (
                      <p className="text-xs">
                        <span className="text-red-500">Title:</span> {prevRev.title} → <span className="text-green-500">{rev.title}</span>
                      </p>
                    )}
                    {prevRev.category !== rev.category && (
                      <p className="text-xs">
                        <span className="text-red-500">Category:</span> {prevRev.category} → <span className="text-green-500">{rev.category}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
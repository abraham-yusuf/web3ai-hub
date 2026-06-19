import { ConfirmDeleteButtonPlain } from "@/components/admin/confirm-delete-button"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import { generateSeo } from "@/lib/seo"

export const metadata: Metadata = generateSeo({
  title: "Topic Clusters",
  description: "Kelola topic clusters untuk SEO internal linking.",
  type: "website",
  canonical: "/admin/seo/topics",
})

type Props = {
  searchParams: Promise<{ action?: string; id?: string }>
}

export default async function TopicClustersPage({ searchParams }: Props) {
  const { action, id } = await searchParams
  const topics = await prisma.topicCluster.findMany({ orderBy: { topic: "asc" } })

  let editTopic = null
  if (action === "edit" && id) {
    editTopic = await prisma.topicCluster.findUnique({ where: { id } })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Topic Clusters</h1>
        <p className="text-muted-foreground mt-1">
          Kelola topic clusters untuk memperkuat internal linking dan topical authority.
        </p>
      </div>

      {/* Create form */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{editTopic ? "Edit Topic Cluster" : "Tambah Topic Cluster"}</h2>
        <form
          action={editTopic ? `/api/admin/seo/topics/${editTopic.id}?/update` : "/api/admin/seo/topics?/create"}
          method="POST"
          className="space-y-4"
        >
          <input type="hidden" name="id" value={editTopic?.id ?? ""} />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Topic Name</label>
              <input
                name="topic"
                required
                defaultValue={editTopic?.topic ?? ""}
                placeholder="Contoh: Solana, DeFi, Smart Contracts"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <input
                name="slug"
                required
                defaultValue={editTopic?.slug ?? ""}
                placeholder="contoh: solana-defi"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editTopic?.description ?? ""}
                placeholder="Deskripsi singkat topic ini..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Keywords (comma-separated)</label>
              <input
                name="keywords"
                defaultValue={editTopic?.keywords?.join(", ") ?? ""}
                placeholder="solana wallet, solana staking, solana nft"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Pillar Pages (slugs, comma-separated)</label>
              <input
                name="pillarPages"
                defaultValue={editTopic?.pillarPages?.join(", ") ?? ""}
                placeholder="solana-untuk-pemula, cara-staking-solana"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Search Volume (optional)</label>
              <input
                name="searchVolume"
                type="number"
                defaultValue={editTopic?.searchVolume ?? ""}
                placeholder="10000"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Difficulty</label>
              <select
                name="difficulty"
                defaultValue={editTopic?.difficulty ?? "medium"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {editTopic ? "Update" : "Create"} Cluster
            </button>
            {editTopic && (
              <a href="/admin/seo/topics" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Topic list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Topic Clusters ({topics.length})</h2>
        {topics.length === 0 ? (
          <p className="text-muted-foreground">Belum ada topic cluster.</p>
        ) : (
          <div className="rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Topic</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Keywords</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Pillars</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Volume</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Difficulty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{topic.topic}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">/topics/{topic.slug}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {topic.keywords.slice(0, 3).join(", ")}
                      {topic.keywords.length > 3 ? ` +${topic.keywords.length - 3}` : ""}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{topic.pillarPages.length}</td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {topic.searchVolume?.toLocaleString("id-ID") ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        topic.difficulty === "easy" ? "bg-green-500/10 text-green-500" :
                        topic.difficulty === "hard" ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {topic.difficulty ?? "medium"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/admin/seo/topics?action=edit&id=${topic.id}`}
                          className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-muted"
                        >
                          Edit
                        </a>
                        <form action={`/api/admin/seo/topics/${topic.id}?/delete`} method="POST">
                          <ConfirmDeleteButtonPlain
                            message={`Hapus topic "${topic.topic}"?`}
                            className="rounded-lg border border-red-500/30 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10"
                          >
                            Delete
                          </ConfirmDeleteButtonPlain>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
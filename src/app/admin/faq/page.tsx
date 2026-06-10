import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { deleteFaqEntryAction } from "./actions"
import { ImportFaqDialog } from "@/components/admin/import-faq-dialog"

export const dynamic = "force-dynamic"

const LANGUAGE_LABELS: Record<string, string> = {
  id: "Indonesia",
  en: "English",
}

const CATEGORIES = ["general", "billing", "technical", "web3", "ai-tools", "account"]

export default async function AdminFaqPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; category?: string }>
}) {
  const params = await searchParams
  const languageFilter = params.lang ?? "all"
  const categoryFilter = params.category ?? "all"

  const where = {
    ...(languageFilter !== "all" ? { language: languageFilter } : {}),
    ...(categoryFilter !== "all" ? { category: categoryFilter } : {}),
  }

  const entries = await prisma.faq.findMany({
    where,
    orderBy: [{ category: "asc" }, { order: "asc" }],
  })

  const total = entries.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQ</h1>
          <p className="text-muted-foreground">
            {total} entr{total !== 1 ? "ies" : "y"}
            {languageFilter !== "all" ? ` · ${LANGUAGE_LABELS[languageFilter] ?? languageFilter}` : ""}
            {categoryFilter !== "all" ? ` · ${categoryFilter}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <ImportFaqDialog />
          <Link
            href="/admin/faq/new"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            + New FAQ
          </Link>
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={categoryFilter !== "all" ? `/admin/faq?category=${categoryFilter}` : "/admin/faq"}
          className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${
            languageFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background hover:bg-muted"
          }`}
        >
          All
        </Link>
        {Object.entries(LANGUAGE_LABELS).map(([lang, label]) => (
          <Link
            key={lang}
            href={`/admin/faq?lang=${lang}${categoryFilter !== "all" ? `&category=${categoryFilter}` : ""}`}
            className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${
              languageFilter === lang
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={languageFilter !== "all" ? `/admin/faq?lang=${languageFilter}` : "/admin/faq"}
          className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${
            categoryFilter === "all"
              ? "bg-secondary text-secondary-foreground"
              : "border border-border bg-background hover:bg-muted"
          }`}
        >
          All Categories
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/admin/faq?category=${cat}${languageFilter !== "all" ? `&lang=${languageFilter}` : ""}`}
            className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium capitalize transition-colors ${
              categoryFilter === cat
                ? "bg-secondary text-secondary-foreground"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Entries Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Question</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Language</th>
              <th className="px-4 py-3 text-left">Published</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium line-clamp-2">{entry.question}</p>
                  <p className="text-xs text-muted-foreground">/{entry.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs capitalize">{entry.category ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{LANGUAGE_LABELS[entry.language] ?? entry.language}</Badge>
                </td>
                <td className="px-4 py-3">
                  {entry.isPublished ? (
                    <span className="inline-flex h-5 items-center justify-center rounded-4xl border border-transparent bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Published
                    </span>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs">{entry.order}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/admin/faq/${entry.id}/edit`}
                        className="inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                    <form action={deleteFaqEntryAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs w-full"
                        onClick={(e) => {
                          if (!confirm("Delete this FAQ entry?")) {
                            e.preventDefault()
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Belum ada FAQ entry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
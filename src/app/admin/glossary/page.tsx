import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { deleteGlossaryEntryAction } from "./actions"
import { ImportGlossaryDialog } from "@/components/admin/import-glossary-dialog"
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button"

export const dynamic = "force-dynamic"

const LANGUAGE_LABELS: Record<string, string> = {
  id: "Indonesia",
  en: "English",
}

export default async function AdminGlossaryPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; q?: string }>
}) {
  const params = await searchParams
  const languageFilter = params.lang ?? "all"
  const searchQuery = params.q ?? ""

  const where = {
    ...(languageFilter !== "all" ? { language: languageFilter } : {}),
    ...(searchQuery
      ? {
          OR: [
            { term: { contains: searchQuery, mode: "insensitive" as const } },
            { definition: { contains: searchQuery, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const entries = await prisma.glossaryEntry.findMany({
    where,
    orderBy: { term: "asc" },
  })

  const total = entries.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Glossary</h1>
          <p className="text-muted-foreground">
            {total} entr{total !== 1 ? "ies" : "y"}
            {languageFilter !== "all" ? ` · ${LANGUAGE_LABELS[languageFilter] ?? languageFilter}` : ""}
            {searchQuery ? ` · Search: "${searchQuery}"` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <ImportGlossaryDialog />
          <Link
            href="/admin/glossary/new"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            + New Entry
          </Link>
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "id", "en"].map((lang) => (
          <Link
            key={lang}
            href={lang === "all" ? "/admin/glossary" : `/admin/glossary?lang=${lang}`}
            className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${
              languageFilter === lang
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {lang === "all" ? "All" : LANGUAGE_LABELS[lang] ?? lang}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="get" className="flex gap-2">
        {languageFilter !== "all" && <input type="hidden" name="lang" value={languageFilter} />}
        <Input
          name="q"
          placeholder="Search by term or definition..."
          defaultValue={searchQuery}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
        {searchQuery && (
          <Link href={languageFilter !== "all" ? `/admin/glossary?lang=${languageFilter}` : "/admin/glossary"}>
            <Button type="button" variant="ghost">
              Clear
            </Button>
          </Link>
        )}
      </form>

      {/* Entries Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Term</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Language</th>
              <th className="px-4 py-3 text-left">Published</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{entry.term}</p>
                  <p className="text-xs text-muted-foreground">/{entry.slug}</p>
                  {entry.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{entry.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs">{entry.category ?? "—"}</span>
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
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/admin/glossary/${entry.id}/edit`}
                        className="inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                    <form action={deleteGlossaryEntryAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <ConfirmDeleteButton
                        message="Delete this glossary entry?"
                        className="h-7 text-xs w-full"
                      >
                        Delete
                      </ConfirmDeleteButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  {searchQuery
                    ? `No entries matching "${searchQuery}"`
                    : "Belum ada glossary entry."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
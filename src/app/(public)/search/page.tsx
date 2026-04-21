import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getSearchTypeLabel, searchContent, type SearchType } from "@/lib/search"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Global Search",
  description: "Cari lintas Blog, Learn, Airdrop, dan AI Tools dalam satu halaman.",
  alternates: { canonical: "/search" },
}

interface SearchPageParams {
  q?: string
  type?: SearchType | "all"
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageParams>
}) {
  const { q = "", type = "all" } = await searchParams
  const results = q.trim() ? await searchContent(q, type) : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Global Search</h1>
        <p className="mt-2 text-lg text-muted-foreground">Cari lintas seluruh konten platform dari satu tempat.</p>
      </div>

      <form method="GET" className="grid gap-3 rounded-xl border p-4 md:grid-cols-5">
        <Input name="q" placeholder="Cari topik, judul, atau keyword..." defaultValue={q} className="md:col-span-3" />
        <select name="type" defaultValue={type} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="all">Semua Konten</option>
          <option value="blog">Blog</option>
          <option value="learn">Learn</option>
          <option value="airdrop">Airdrop</option>
          <option value="tool">AI Tools</option>
        </select>
        <button type="submit" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Query: {q || "-"}</Badge>
        <Badge variant="outline">Filter: {type}</Badge>
        <Badge variant="outline">Results: {results.length}</Badge>
      </div>

      <div className="grid gap-4">
        {q.trim().length === 0 ? (
          <div className="rounded-lg border bg-muted/20 py-16 text-center">
            <p className="text-muted-foreground">Masukkan kata kunci untuk mulai mencari.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg border bg-muted/20 py-16 text-center">
            <p className="text-muted-foreground">Tidak ada hasil untuk pencarian ini.</p>
          </div>
        ) : (
          results.map((result) => (
            <Link key={result.id} href={result.href}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge>{getSearchTypeLabel(result.type)}</Badge>
                    {result.category ? <Badge variant="outline">{result.category}</Badge> : null}
                  </div>
                  <CardTitle>{result.title}</CardTitle>
                  <CardDescription>{result.href}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{result.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

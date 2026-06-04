"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ImportedToolData, BulkImportResult } from "../actions"

type Tab = "url" | "bulk"

type UrlPreview = ImportedToolData & { url: string; error?: string }

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function ImportToolsPage() {
  const [tab, setTab] = useState<Tab>("url")
  const [isPending, startTransition] = useTransition()

  // URL Import state
  const [urlInput, setUrlInput] = useState("")
  const [urlPreviews, setUrlPreviews] = useState<UrlPreview[]>([])
  const [urlErrors, setUrlErrors] = useState<string[]>([])
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)

  // Bulk Import state
  const [bulkInput, setBulkInput] = useState("")
  const [bulkParsed, setBulkParsed] = useState<ImportedToolData[]>([])
  const [bulkErrors, setBulkErrors] = useState<string[]>([])
  const [bulkImportResult, setBulkImportResult] = useState<BulkImportResult | null>(null)

  const fetchUrlPreviews = () => {
    const urls = urlInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0)

    if (urls.length === 0) {
      setUrlErrors(["Please enter at least one URL"])
      return
    }

    setUrlPreviews([])
    setUrlErrors([])
    setImportResult(null)

    const results: UrlPreview[] = []
    let completed = 0

    urls.forEach((url) => {
      startTransition(async () => {
        try {
          const res = await fetch("/api/tools/import-from-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          })
          const data = await res.json()

          if (data.error) {
            results.push({ url, name: "", slug: "", error: data.error })
          } else {
            results.push({ url, ...data })
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to fetch"
          results.push({ url, name: "", slug: "", error: msg })
        }

        completed++
        if (completed === urls.length) {
          setUrlPreviews(results)
        }
      })
    })
  }

  const importUrlPreviews = () => {
    const valid = urlPreviews.filter((p) => !p.error && p.name)
    if (valid.length === 0) return

    startTransition(async () => {
      const tools = valid.map((p) => ({
        name: p.name,
        slug: p.slug,
        tagline: p.tagline ?? undefined,
        description: p.description ?? undefined,
        pricing: p.pricing,
        category: p.category,
        websiteUrl: p.websiteUrl ?? undefined,
        affiliateUrl: p.affiliateUrl ?? undefined,
      }))

      const res = await fetch("/api/tools/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools }),
      })
      const data: BulkImportResult = await res.json()
      setImportResult(data)
    })
  }

  const parseBulkInput = () => {
    setBulkParsed([])
    setBulkErrors([])
    setBulkImportResult(null)

    const raw = bulkInput.trim()
    if (!raw) {
      setBulkErrors(["Please enter data to import"])
      return
    }

    let parsed: unknown

    // Try JSON first
    if (raw.startsWith("[")) {
      try {
        parsed = JSON.parse(raw)
      } catch {
        setBulkErrors(["Invalid JSON format. Please check your input."])
        return
      }
    } else {
      // Try CSV: name,slug,tagline,description,pricing,category,websiteUrl,affiliateUrl
      const lines = raw.split("\n").filter((l) => l.trim())
      if (lines.length === 0) {
        setBulkErrors(["No data found"])
        return
      }

      const tools: Array<{
        name: string
        slug?: string
        tagline?: string
        description?: string
        pricing?: string
        category?: string
        websiteUrl?: string
        affiliateUrl?: string
      }> = []

      for (const line of lines) {
        const fields = line.split(",").map((f) => f.trim().replace(/^["']|["']$/g, ""))
        if (fields.length < 1 || !fields[0]) continue
        tools.push({
          name: fields[0] || "",
          slug: fields[1] || undefined,
          tagline: fields[2] || undefined,
          description: fields[3] || undefined,
          pricing: fields[4] || undefined,
          category: fields[5] || undefined,
          websiteUrl: fields[6] || undefined,
          affiliateUrl: fields[7] || undefined,
        })
      }

      if (tools.length === 0) {
        setBulkErrors(["No valid entries found in CSV"])
        return
      }

      parsed = tools
    }

    if (!Array.isArray(parsed)) {
      setBulkErrors(["Expected an array of tools"])
      return
    }

    const typed = parsed as Array<{
      name: string
      slug?: string
      tagline?: string
      description?: string
      pricing?: string
      category?: string
      websiteUrl?: string
      affiliateUrl?: string
    }>

    if (typed.length === 0) {
      setBulkErrors(["Array is empty"])
      return
    }

    const withSlugs = typed.map((t) => ({
      ...t,
      slug: t.slug || slugify(t.name),
    }))

    setBulkParsed(withSlugs)
  }

  const importBulk = () => {
    if (bulkParsed.length === 0) return

    startTransition(async () => {
      const res = await fetch("/api/tools/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: bulkParsed }),
      })
      const data: BulkImportResult = await res.json()
      setBulkImportResult(data)
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import AI Tools</h1>
          <p className="text-muted-foreground">Auto-generate or bulk import tools from URLs or structured data.</p>
        </div>
        <Link href="/admin/tools" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
          ← Back
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border p-1">
        <button
          onClick={() => { setTab("url"); setImportResult(null) }}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "url" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
        >
          Import from URLs
        </button>
        <button
          onClick={() => { setTab("bulk"); setBulkImportResult(null) }}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "bulk" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
        >
          Bulk Import (JSON / CSV)
        </button>
      </div>

      {/* URL Import Tab */}
      {tab === "url" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">URLs (one per line)</label>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={"https://chat.openai.com\nhttps://claude.ai\nhttps://gemini.google.com"}
              className="min-h-32 w-full rounded-md border bg-background p-3 text-sm font-mono"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={fetchUrlPreviews} disabled={isPending}>
              {isPending ? "Fetching..." : "Fetch & Preview"}
            </Button>
            {urlPreviews.length > 0 && (
              <Button onClick={importUrlPreviews} disabled={isPending} variant="default">
                {isPending ? "Importing..." : `Import ${urlPreviews.filter((p) => !p.error).length} Tool(s)`}
              </Button>
            )}
          </div>

          {urlErrors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <ul className="list-disc list-inside">
                {urlErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {urlPreviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Preview</h3>
              {urlPreviews.map((p, i) => (
                <div key={i} className={`rounded-md border p-4 ${p.error ? "border-red-200 bg-red-50" : "border-muted"}`}>
                  {p.error ? (
                    <div className="text-sm text-red-700">
                      <span className="font-mono text-xs">{p.url}</span>
                      <p className="mt-1 font-medium">Error: {p.error}</p>
                    </div>
                  ) : (
                    <div className="grid gap-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{p.name}</span>
                        <span className="rounded bg-muted px-2 py-0.5 text-xs">{p.pricing}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{p.slug}</span>
                      {p.tagline && <p className="text-muted-foreground">{p.tagline}</p>}
                      {p.logo && <img src={p.logo} alt="" className="h-8 w-8 rounded object-contain" />}
                      <span className="text-xs text-muted-foreground">{p.url}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {importResult && (
            <div className={`rounded-md border p-4 text-sm ${importResult.errors.length === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}>
              <p className="font-medium text-green-800">
                Successfully imported: {importResult.success}
                {importResult.errors.length > 0 && (
                  <span className="ml-3 text-yellow-700">Failed: {importResult.errors.length}</span>
                )}
              </p>
              {importResult.errors.map((e, i) => (
                <p key={i} className="mt-1 text-xs text-yellow-700">
                  Row {e.index + 1} ({e.name}): {e.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Import Tab */}
      {tab === "bulk" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">JSON array or CSV (one tool per line)</label>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={`[\n  { "name": "ChatGPT", "slug": "chatgpt", "tagline": "AI assistant", "pricing": "Freemium", "category": "Productivity" },\n  { "name": "Claude", "slug": "claude", "pricing": "Freemium", "category": "Productivity" }\n]`}
              className="min-h-48 w-full rounded-md border bg-background p-3 text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              CSV format: name,slug,tagline,description,pricing,category,websiteUrl,affiliateUrl
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={parseBulkInput} disabled={isPending} variant="outline">
              Parse & Preview
            </Button>
            {bulkParsed.length > 0 && (
              <Button onClick={importBulk} disabled={isPending}>
                {isPending ? "Importing..." : `Import ${bulkParsed.length} Tool(s)`}
              </Button>
            )}
          </div>

          {bulkErrors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <ul className="list-disc list-inside">
                {bulkErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {bulkParsed.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Preview ({bulkParsed.length} tools)</h3>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Slug</th>
                      <th className="px-3 py-2 text-left font-medium">Tagline</th>
                      <th className="px-3 py-2 text-left font-medium">Pricing</th>
                      <th className="px-3 py-2 text-left font-medium">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkParsed.map((tool, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 font-medium">{tool.name}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{tool.slug}</td>
                        <td className="px-3 py-2">{tool.tagline || "-"}</td>
                        <td className="px-3 py-2">{tool.pricing || "Freemium"}</td>
                        <td className="px-3 py-2">{tool.category || "General"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {bulkImportResult && (
            <div className={`rounded-md border p-4 text-sm ${bulkImportResult.errors.length === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}>
              <p className="font-medium text-green-800">
                Successfully imported: {bulkImportResult.success}
                {bulkImportResult.errors.length > 0 && (
                  <span className="ml-3 text-yellow-700">Failed: {bulkImportResult.errors.length}</span>
                )}
              </p>
              {bulkImportResult.errors.map((e, i) => (
                <p key={i} className="mt-1 text-xs text-yellow-700">
                  Row {e.index + 1} ({e.name}): {e.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
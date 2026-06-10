"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Star, Copy, Share2, Sparkles, X, Check, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ToolData {
  id: string
  name: string
  slug: string
  tagline: string
  category: string
  pricing: string
  pricingModel: string
  rating: number
  reviews: number
  features: string[]
  pros: string[]
  cons: string[]
  affiliateUrl: string | null
  imageUrl: string | null
  featured: boolean
  hasFreeTrial: boolean
  hasApiAccess: boolean
  multiLanguage: boolean
  affiliateAvailable: boolean
}

type ToolDataKey = keyof ToolData

interface Criteria {
  key: ToolDataKey
  label: string
  format: (value: unknown) => string
}

const COMPARISON_CRITERIA: Criteria[] = [
  { key: "rating", label: "Overall Rating", format: (v) => `${v} ⭐` },
  { key: "pricing", label: "Pricing", format: (v) => String(v) },
  { key: "pricingModel", label: "Pricing Model", format: (v) => String(v) },
  { key: "category", label: "Category", format: (v) => String(v) },
  { key: "hasFreeTrial", label: "Free Trial", format: (v) => (v ? "Yes" : "No") },
  { key: "hasApiAccess", label: "API Access", format: (v) => (v ? "Yes" : "No") },
  { key: "multiLanguage", label: "Multi-language Support", format: (v) => (v ? "Yes" : "No") },
  { key: "affiliateAvailable", label: "Affiliate Available", format: (v) => (v ? "Yes" : "No") },
]

function getToolValue(tool: ToolData, key: ToolDataKey): unknown {
  return tool[key]
}

export default function CompareToolsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tools, setTools] = useState<ToolData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showShareToast, setShowShareToast] = useState(false)

  const slugs = searchParams.get("slugs")?.split(",").filter(Boolean).slice(0, 3) ?? []

  const fetchTools = useCallback(async () => {
    if (slugs.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/tools/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlugs: slugs }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch tools")
      }

      const data = await response.json()
      setTools(data.tools)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [slugs])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  const generateAiSummary = async () => {
    if (tools.length < 2) return

    setAiLoading(true)
    setAiSummary(null)

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          provider: "openai",
          content: buildComparisonPrompt(tools),
          language: "id",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate AI summary")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let summaryText = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          summaryText += decoder.decode(value, { stream: true })
        }
      }

      setAiSummary(summaryText.replace(/\[ERROR\].*/g, "").trim())
    } catch {
      setAiSummary("Gagal menghasilkan ringkasan. Silakan coba lagi.")
    } finally {
      setAiLoading(false)
    }
  }

  const copyComparison = () => {
    const markdown = buildMarkdownTable(tools)
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareComparison = async () => {
    const url = `${window.location.origin}/ai-tools/compare?slugs=${slugs.join(",")}`
    try {
      await navigator.clipboard.writeText(url)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    } catch {
      router.push(`/ai-tools/compare?slugs=${slugs.join(",")}`)
    }
  }

  const clearAll = () => {
    router.push("/ai-tools")
  }

  const popularTools = [
    { name: "ChatGPT", slug: "chatgpt" },
    { name: "Claude", slug: "claude" },
    { name: "Midjourney", slug: "midjourney" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compare AI Tools</h1>
          <p className="mt-1 text-muted-foreground">
            Bandingkan fitur, harga, dan spesifikasi berbagai AI tools
          </p>
        </div>
        {tools.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyComparison}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={shareComparison}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {showShareToast && (
        <div className="rounded-lg bg-green-100 px-4 py-2 text-sm text-green-800 dark:bg-green-900 dark:text-green-100">
          Link copied to clipboard!
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && tools.length < 2 && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Select Tools to Compare</CardTitle>
            <CardDescription>
              Pilih minimal 2 AI tools untuk memulai perbandingan. Berikut saran tools populer:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {popularTools.map((tool) => (
                <Badge
                  key={tool.slug}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => {
                    const newSlugs = [...new Set([...slugs, tool.slug])].slice(0, 3)
                    router.push(`/ai-tools/compare?slugs=${newSlugs.join(",")}`)
                  }}
                >
                  {tool.name}
                </Badge>
              ))}
            </div>
            <Link
              href="/ai-tools"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Browse all AI tools <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && tools.length >= 2 && (
        <>
          {/* JSON-LD for comparison page */}
          <script
            id="compare-tools-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                itemListElement: tools.map((tool, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: tool.name,
                  url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://ai3.my.id"}/ai-tools/${tool.slug}`,
                  description: tool.tagline,
                })),
                numberOfItems: tools.length,
              }),
            }}
          />

          {/* AI Summary Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">AI-Powered Comparison</CardTitle>
                </div>
                <Button
                  size="sm"
                  onClick={generateAiSummary}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <span className="mr-2 animate-spin">&#x27F3;</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {aiSummary && (
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm">{aiSummary}</p>
                </div>
              </CardContent>
            )}
            {aiLoading && !aiSummary && (
              <CardContent>
                <Skeleton className="h-20 w-full" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Generating AI-powered comparison summary...
                </p>
              </CardContent>
            )}
          </Card>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Metric</th>
                  {tools.map((tool) => (
                    <th key={tool.id} className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        {tool.featured && <Badge variant="default" className="text-xs">Featured</Badge>}
                        <span className="font-semibold">{tool.name}</span>
                      </div>
                      <p className="mt-1 text-xs font-normal text-muted-foreground line-clamp-2">
                        {tool.tagline}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_CRITERIA.map((criteria, idx) => (
                  <tr key={criteria.key} className={idx > 0 ? "border-t" : ""}>
                    <td className="px-4 py-3 font-medium">{criteria.label}</td>
                    {tools.map((tool) => {
                      const value = getToolValue(tool, criteria.key)
                      return (
                        <td key={tool.id} className="px-4 py-3">
                          {criteria.format(value)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Features Row */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Features</td>
                  {tools.map((tool) => (
                    <td key={tool.id} className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tool.features.map((f) => (
                          <Badge key={f} variant="outline" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Rating Stars Row */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Rating</td>
                  {tools.map((tool) => (
                    <td key={tool.id} className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{tool.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({tool.reviews} reviews)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Website Row */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Visit</td>
                  {tools.map((tool) => (
                    <td key={tool.id} className="px-4 py-3">
                      {tool.affiliateUrl ? (
                        <a
                          href={tool.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary hover:underline"
                        >
                          Visit Website &#x2192;
                        </a>
                      ) : (
                        <Link
                          href={`/ai-tools/${tool.slug}`}
                          className="text-primary hover:underline"
                        >
                          View Details &#x2192;
                        </Link>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pros & Cons Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {tools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      &#x2713; Pros
                    </h4>
                    {tool.pros.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {tool.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500">&#x2022;</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No pros listed yet.
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">
                      &#x2717; Cons
                    </h4>
                    {tool.cons.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {tool.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500">&#x2022;</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No cons listed yet.
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/ai-tools/${tool.slug}`}
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    View full details &#x2192;
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function buildComparisonPrompt(tools: ToolData[]): string {
  const toolList = tools
    .map(
      (t, i) =>
        `${i + 1}. ${t.name} (${t.category})\n   - Rating: ${t.rating}/5\n   - Pricing: ${t.pricing}\n   - Features: ${t.features.join(", ") || "N/A"}\n   - Free Trial: ${t.hasFreeTrial ? "Yes" : "No"}\n   - API Access: ${t.hasApiAccess ? "Yes" : "No"}\n   - Multi-language: ${t.multiLanguage ? "Yes" : "No"}`
    )
    .join("\n\n")

  return `Bandingkan ${tools.length} AI tools berikut secara objektif dalam Bahasa Indonesia:

${toolList}

Buat ringkasan perbandingan yang mencakup:
1. Tool mana yang terbaik untuk use case tertentu
2. Perbandingan harga dan nilai
3. Strengths dan weaknesses masing-masing tool
4. Rekomendasi untuk pengguna berbeda (pemula, profesional, bisnis)

Format output dalam Markdown.`
}

function buildMarkdownTable(tools: ToolData[]): string {
  const headers = ["Metric", ...tools.map((t) => t.name)]
  const rows = [
    ["Category", ...tools.map((t) => t.category)],
    ["Pricing", ...tools.map((t) => t.pricing)],
    ["Rating", ...tools.map((t) => `${t.rating}/5`)],
    ["Free Trial", ...tools.map((t) => (t.hasFreeTrial ? "Yes" : "No"))],
    ["API Access", ...tools.map((t) => (t.hasApiAccess ? "Yes" : "No"))],
    ["Multi-language", ...tools.map((t) => (t.multiLanguage ? "Yes" : "No"))],
    [
      "Features",
      ...tools.map((t) => t.features.join(", ") || "N/A"),
    ],
  ]

  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i]).length))
  )

  const formatRow = (cells: string[]) =>
    `| ${cells.map((c, i) => c.padEnd(colWidths[i])).join(" | ")} |`

  const separator = `| ${colWidths.map((w) => "-".repeat(w)).join(" | ")} |`

  return [
    `# AI Tools Comparison`,
    "",
    formatRow(headers),
    separator,
    ...rows.map(formatRow),
    "",
    `Generated from AI3 - AI Tools Directory`,
  ].join("\n")
}
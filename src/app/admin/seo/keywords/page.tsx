"use client"

import { useState } from "react"

export default function KeywordSuggestionClient() {
  const [seed, setSeed] = useState("")
  const [type, setType] = useState<"blog" | "tool" | "airdrop" | "learn">("blog")
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [keywords, setKeywords] = useState<Array<{ keyword: string; intent: string; volume: string }>>([])
  const [error, setError] = useState("")

  const handleSuggest = async () => {
    if (!seed.trim()) return
    setLoading(true)
    setError("")
    setKeywords([])

    try {
      const res = await fetch("/api/admin/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: seed.trim(), type, count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate keywords")
      setKeywords(data.keywords ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const volumeColor = (v: string) =>
    v === "high" ? "text-green-500" : v === "medium" ? "text-yellow-500" : "text-muted-foreground"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Keyword Suggestion</h1>
        <p className="text-muted-foreground mt-1">
          Generate SEO keyword suggestions menggunakan AI berdasarkan seed topic.
        </p>
      </div>

      {/* Input form */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Seed Topic</label>
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Contoh: Solana DeFi, smart contract security"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Content Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="blog">Blog Post</option>
              <option value="tool">AI Tool</option>
              <option value="airdrop">Airdrop</option>
              <option value="learn">Learn Page</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Count</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleSuggest}
          disabled={loading || !seed.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Keywords"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Results */}
      {keywords.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Suggested Keywords ({keywords.length})</h2>
          <div className="rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Keyword</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Intent</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {keywords.map((kw, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{kw.keyword}</td>
                    <td className="px-4 py-3 text-center text-xs">
                      <span className={`rounded-full px-2 py-0.5 ${
                        kw.intent === "informational" ? "bg-blue-500/10 text-blue-500" :
                        kw.intent === "transactional" ? "bg-green-500/10 text-green-500" :
                        "bg-purple-500/10 text-purple-500"
                      }`}>
                        {kw.intent}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center text-sm font-medium ${volumeColor(kw.volume)}`}>
                      {kw.volume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(keywords.map((k) => k.keyword).join("\n"))}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Copy All Keywords
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
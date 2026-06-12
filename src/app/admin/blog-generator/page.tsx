"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type BlogCategory = "web3-fundamentals" | "ai-tutorials" | "airdrop-guides" | "opinion-news"

const CATEGORIES: { id: BlogCategory; label: string; description: string }[] = [
  { id: "web3-fundamentals", label: "Web3 Fundamentals", description: "Dasar-dasar blockchain, DeFi, NFT, wallet" },
  { id: "ai-tutorials", label: "AI Tutorials", description: "Tutorial AI tools, prompt engineering, LLM" },
  { id: "airdrop-guides", label: "Airdrop Guides", description: "Panduan airdrop, cara klaim, hindari scam" },
  { id: "opinion-news", label: "Opinion/News", description: "Tren Web3/AI, analisis pasar, opini" },
]

type GeneratedDraft = {
  title: string
  slug: string
  excerpt: string
  tags: string[]
  readingTime: number
  seo: { titleTag: string; metaDescription: string }
  content: string
}

type SimilarityResult = {
  maxSimilarity: number
  blocked: boolean
  matches: Array<{ slug: string; title: string; similarity: number }>
  message?: string
}

export default function BlogGeneratorPage() {
  const [category, setCategory] = useState<BlogCategory>("web3-fundamentals")
  const [topic, setTopic] = useState("")
  const [language, setLanguage] = useState("id")
  const [customPrompt, setCustomPrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [draft, setDraft] = useState<GeneratedDraft | null>(null)
  const [error, setError] = useState("")
  const [similarity, setSimilarity] = useState<SimilarityResult | null>(null)
  const [checkingSimilarity, setCheckingSimilarity] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setGenerating(true)
    setError("")
    setDraft(null)
    setSimilarity(null)

    try {
      const res = await fetch("/api/admin/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, topic, language, customPrompt: customPrompt || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Generation failed")
      }

      const text = await res.text()

      // Try to parse JSON from the streamed response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as GeneratedDraft
        setDraft(parsed)
      } else {
        setError("AI returned invalid format. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const handleCheckSimilarity = async () => {
    if (!draft) return
    setCheckingSimilarity(true)

    try {
      const res = await fetch("/api/admin/posts/similarity-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.content, excludeSlug: draft.slug }),
      })

      const data = await res.json()
      setSimilarity(data)
    } catch {
      setSimilarity(null)
    } finally {
      setCheckingSimilarity(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blog Content Generator</h1>
        <p className="text-muted-foreground">Generate blog posts one at a time with AI assistance</p>
      </div>

      {/* Generation Form */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} — {cat.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Apa Itu Blockchain?"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customPrompt">Custom Instructions (optional)</Label>
          <Input
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., Focus on Indonesian use cases"
            className="mt-1"
          />
        </div>

        <Button onClick={handleGenerate} disabled={generating || !topic.trim()}>
          {generating ? "Generating..." : "Generate Blog Post"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-300 bg-red-50 dark:bg-red-950 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Draft Preview */}
      {draft && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generated Draft</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCheckSimilarity} disabled={checkingSimilarity}>
                {checkingSimilarity ? "Checking..." : "Check Similarity"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Title:</strong> {draft.title}</div>
            <div><strong>Slug:</strong> {draft.slug}</div>
            <div><strong>Reading Time:</strong> {draft.readingTime} min</div>
            <div><strong>Tags:</strong> {draft.tags?.join(", ")}</div>
          </div>

          <div className="text-sm">
            <strong>Excerpt:</strong> {draft.excerpt}
          </div>

          <div className="text-sm">
            <strong>SEO Title:</strong> {draft.seo?.titleTag}
          </div>
          <div className="text-sm">
            <strong>Meta Description:</strong> {draft.seo?.metaDescription}
          </div>

          {/* Similarity Result */}
          {similarity && (
            <div className={`border rounded p-3 text-sm ${similarity.blocked ? "border-red-300 bg-red-50 dark:bg-red-950" : "border-green-300 bg-green-50 dark:bg-green-950"}`}>
              <strong>Similarity: {Math.round(similarity.maxSimilarity * 100)}%</strong>
              {similarity.blocked && (
                <span className="ml-2 text-red-600 font-medium">BLOCKED — too similar to existing content</span>
              )}
              {similarity.matches.length > 0 && (
                <ul className="mt-1 list-disc list-inside">
                  {similarity.matches.map((m) => (
                    <li key={m.slug}>{m.title} ({Math.round(m.similarity * 100)}%)</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Content Preview */}
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">View Content ({draft.content?.length || 0} chars)</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {draft.content}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

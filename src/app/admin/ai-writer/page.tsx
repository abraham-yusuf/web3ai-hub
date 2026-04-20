"use client"

import { useMemo, useState } from "react"
import type { AIProvider } from "@/lib/ai/types"

const providerModels: Record<AIProvider, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4.1-mini"],
  anthropic: ["claude-3-5-haiku-latest", "claude-3-7-sonnet-latest"],
  google: ["gemini-1.5-flash", "gemini-1.5-pro"],
  groq: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"],
}

export default function AdminAIWriterPage() {
  const [topic, setTopic] = useState("")
  const [language, setLanguage] = useState("Bahasa Indonesia")
  const [tone, setTone] = useState("educational")
  const [length, setLength] = useState("medium")
  const [template, setTemplate] = useState("tutorial")
  const [provider, setProvider] = useState<AIProvider>("openai")
  const [model, setModel] = useState(providerModels.openai[0])
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const availableModels = useMemo(() => providerModels[provider], [provider])

  async function generate() {
    setIsGenerating(true)
    setError("")
    setContent("")

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topic,
          language,
          tone,
          length,
          template,
          provider,
          model,
        }),
      })

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Gagal generate konten")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setContent((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">AI Writer</h1>
          <p className="text-muted-foreground">Generate draft artikel dengan fallback multi-provider.</p>
        </div>
        <a href="/admin/settings" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">AI Settings</a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="space-y-4 rounded-lg border p-4">
          <label className="space-y-2 text-sm block">
            <span className="font-medium">Topik</span>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2" placeholder="Contoh: Strategi DeFi untuk pemula" />
          </label>

          <label className="space-y-2 text-sm block">
            <span className="font-medium">Bahasa</span>
            <input value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2" />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm block">
              <span className="font-medium">Tone</span>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
                <option value="educational">Educational</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </label>

            <label className="space-y-2 text-sm block">
              <span className="font-medium">Panjang</span>
              <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm block">
              <span className="font-medium">Template Prompt</span>
              <select value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
                <option value="tutorial">Tutorial</option>
                <option value="opinion">Opinion</option>
                <option value="news">News Summary</option>
                <option value="tool-review">Tool Review</option>
                <option value="airdrop-guide">Airdrop Guide</option>
              </select>
            </label>

            <label className="space-y-2 text-sm block">
              <span className="font-medium">Provider</span>
              <select
                value={provider}
                onChange={(e) => {
                  const nextProvider = e.target.value as AIProvider
                  setProvider(nextProvider)
                  setModel(providerModels[nextProvider][0])
                }}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="groq">Groq</option>
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm block">
            <span className="font-medium">Model</span>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
              {availableModels.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={isGenerating || topic.trim().length < 4}
            onClick={generate}
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </section>

        <section className="space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Generated Draft</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(content)}
                disabled={!content}
                className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium disabled:opacity-50"
              >
                Copy
              </button>
              <a
                href={`/admin/posts/new?title=${encodeURIComponent(topic)}&content=${encodeURIComponent(content)}`}
                className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium"
              >
                Insert to Editor
              </a>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[520px] w-full rounded-md border bg-background p-3 font-mono text-sm"
            placeholder="Hasil streaming akan tampil di sini..."
          />
        </section>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

type Tab = "quiz" | "flashcard" | "lesson"

const QUIZ_COUNTS = [3, 5, 10, 15, 20]
const FLASHCARD_COUNTS = [5, 10, 15, 20, 30]

function QuizGenerator() {
  const [pageSlug, setPageSlug] = useState("")
  const [pageTitle, setPageTitle] = useState("")
  const [content, setContent] = useState("")
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [saved, setSaved] = useState(false)

  async function generate() {
    if (!content.trim()) {
      toast.error("Konten materi diperlukan")
      return
    }
    setLoading(true)
    setResult("")
    setSaved(false)

    try {
      const res = await fetch("/api/learn/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageTitle: pageTitle || "Materi", content, count, mode: "quiz", language: "Indonesian" }),
      })
      if (!res.body) throw new Error("No response")
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let raw = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value, { stream: true })
        raw += chunk
        setResult((p) => p + chunk)
      }

      // Auto-save to DB
      if (pageSlug && raw) {
        try {
          const jsonMatch = raw.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            await fetch(`/api/learn/chat?pageSlug=${pageSlug}&type=quiz`, {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ pageSlug, title: `Kuis - ${pageTitle || pageSlug}`, questions: JSON.parse(jsonMatch[0]) }),
            })
            setSaved(true)
            toast.success("Kuis disimpan ke database")
          }
        } catch {
          toast.error("Gagal menyimpan kuis")
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat kuis")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Page Slug (untuk disimpan)</Label>
          <Input value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} placeholder="web3-basics/intro" />
        </div>
        <div className="space-y-2">
          <Label>Judul Materi</Label>
          <Input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="Judul materi" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Konten Materi</Label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste konten materi di sini..."
          className="min-h-40 w-full rounded-md border bg-background p-3 text-sm font-mono"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">Jumlah soal:</span>
        {QUIZ_COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            className={`rounded-md border px-3 py-1 text-sm ${count === n ? "border-primary bg-primary/10" : ""}`}
          >
            {n}
          </button>
        ))}
      </div>
      <Button onClick={() => void generate()} disabled={loading}>
        {loading ? "Menghasilkan..." : "🔮 Generate Kuis"}
      </Button>
      {result && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium">Hasil Kuis (JSON)</p>
            {saved && <span className="text-xs text-green-600">✅ Tersimpan</span>}
          </div>
          <pre className="max-h-96 overflow-auto text-xs whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}

function FlashcardGenerator() {
  const [pageSlug, setPageSlug] = useState("")
  const [pageTitle, setPageTitle] = useState("")
  const [content, setContent] = useState("")
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [saved, setSaved] = useState(false)

  async function generate() {
    if (!content.trim()) {
      toast.error("Konten materi diperlukan")
      return
    }
    setLoading(true)
    setResult("")
    setSaved(false)

    try {
      const res = await fetch("/api/learn/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageTitle: pageTitle || "Materi", content, count, mode: "flashcard", language: "Indonesian" }),
      })
      if (!res.body) throw new Error("No response")
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let raw = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value, { stream: true })
        raw += chunk
        setResult((p) => p + chunk)
      }

      if (pageSlug && raw) {
        try {
          const jsonMatch = raw.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const cards = JSON.parse(jsonMatch[0])
            await fetch(`/api/learn/flashcards?pageSlug=${pageSlug}`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ pageSlug, cards }),
            })
            setSaved(true)
            toast.success(`${cards.length} flashcard disimpan ke database`)
          }
        } catch {
          toast.error("Gagal menyimpan flashcard")
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat flashcard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Page Slug (untuk disimpan)</Label>
          <Input value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} placeholder="web3-basics/intro" />
        </div>
        <div className="space-y-2">
          <Label>Judul Materi</Label>
          <Input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="Judul materi" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Konten Materi</Label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste konten materi di sini..."
          className="min-h-40 w-full rounded-md border bg-background p-3 text-sm font-mono"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">Jumlah kartu:</span>
        {FLASHCARD_COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            className={`rounded-md border px-3 py-1 text-sm ${count === n ? "border-primary bg-primary/10" : ""}`}
          >
            {n}
          </button>
        ))}
      </div>
      <Button onClick={() => void generate()} disabled={loading}>
        {loading ? "Menghasilkan..." : "🔮 Generate Flashcard"}
      </Button>
      {result && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium">Hasil Flashcard (JSON)</p>
            {saved && <span className="text-xs text-green-600">✅ Tersimpan</span>}
          </div>
          <pre className="max-h-96 overflow-auto text-xs whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}

function LessonGenerator() {
  const [topic, setTopic] = useState("")
  const [trackTitle, setTrackTitle] = useState("")
  const [level, setLevel] = useState("intermediate")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  async function generate() {
    if (!topic.trim()) {
      toast.error("Topik diperlukan")
      return
    }
    setLoading(true)
    setResult("")

    try {
      const res = await fetch("/api/learn/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageTitle: topic, content: topic, mode: "lesson", trackTitle: trackTitle || "General", level, language: "Indonesian" }),
      })
      if (!res.body) throw new Error("No response")
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setResult((p) => p + dec.decode(value, { stream: true }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat materi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Topik / Judul Materi</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Apa itu Blockchain?" />
        </div>
        <div className="space-y-2">
          <Label>Track</Label>
          <Input value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} placeholder="Web3 & Blockchain" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Level: {level}</Label>
        <div className="flex gap-2">
          {["beginner", "intermediate", "advanced"].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-md border px-3 py-1 text-sm capitalize ${level === l ? "border-primary bg-primary/10" : ""}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={() => void generate()} disabled={loading}>
        {loading ? "Menghasilkan..." : "🔮 Generate Materi"}
      </Button>
      {result && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-xs font-medium mb-2">Hasil Materi (JSON)</p>
          <pre className="max-h-96 overflow-auto text-xs whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}

export default function LearnAIToolsPage() {
  const [tab, setTab] = useState<Tab>("quiz")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Learn Tools</h1>
        <p className="text-muted-foreground">Generate kuis, flashcard, dan materi belajar dengan AI.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b">
        {([
          ["quiz", "📝 Quiz Generator"],
          ["flashcard", "🃏 Flashcard Generator"],
          ["lesson", "📖 Lesson Generator"],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "quiz" ? "📝 Quiz Generator" : tab === "flashcard" ? "🃏 Flashcard Generator" : "📖 AI Lesson Generator"}
          </CardTitle>
          <CardDescription>
            {tab === "quiz"
              ? "Generate pilihan ganda dari konten materi. Hasil otomatis disimpan ke database."
              : tab === "flashcard"
              ? "Generate flashcard (depan: pertanyaan, belakang: jawaban) dari materi."
              : "Generate materi belajar lengkap (judul, excerpt, konten Markdown) dari topik."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tab === "quiz" ? <QuizGenerator /> : tab === "flashcard" ? <FlashcardGenerator /> : <LessonGenerator />}
        </CardContent>
      </Card>
    </div>
  )
}
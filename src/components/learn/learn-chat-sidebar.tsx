"use client"

import { useEffect, useMemo, useState } from "react"
import { onExplainEvent } from "./learn-events"

type ChatMode = "assistant" | "explain" | "simplify" | "translate" | "quiz" | "flashcard"

type LearnChatSidebarProps = {
  title: string
  content: string
  pageSlug?: string
}

const MODE_LABELS: Record<ChatMode, string> = {
  assistant: "Tanya AI",
  explain: "Jelaskan",
  simplify: "Sederhanakan",
  translate: "Terjemahkan",
  quiz: "Buat Kuis",
  flashcard: "Buat Flashcard",
}

const MODE_ICONS: Record<ChatMode, string> = {
  assistant: "💬",
  explain: "🔍",
  simplify: "📖",
  translate: "🌐",
  quiz: "📝",
  flashcard: "🃏",
}

const TRANSLATE_LANGUAGES = [
  { value: "English", label: "🇬🇧 English" },
  { value: "Indonesian", label: "🇮🇩 Indonesia" },
  { value: "Japanese", label: "🇯🇵 日本語" },
  { value: "Chinese", label: "🇨🇳 中文" },
]

const QUIZ_COUNTS = [3, 5, 10, 15]
const FLASHCARD_COUNTS = [5, 10, 15, 20]

function buildQuickPrompts(mode: ChatMode, content: string): string[] {
  const headings = content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace("## ", "").trim())
    .slice(0, 3)

  if (mode === "assistant") {
    return [
      ...(headings[0] ? [`Jelaskan bagian "${headings[0]}" dengan bahasa sederhana.`] : []),
      ...(headings[1] ? [`Apa poin paling penting dari "${headings[1]}"?`] : []),
      "Berikan 3 kesalahan umum yang harus dihindari dari materi ini.",
    ]
  }
  if (mode === "explain" && headings[0]) {
    return [`Jelaskan "${headings[0]}" secara detail`]
  }
  return []
}

export function LearnChatSidebar({ title, content, pageSlug }: LearnChatSidebarProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ChatMode>("assistant")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [translateTo, setTranslateTo] = useState("English")
  const [quizCount, setQuizCount] = useState(5)
  const [flashcardCount, setFlashcardCount] = useState(10)
  const [savedFlashcards, setSavedFlashcards] = useState<Array<{ front: string; back: string }>>([])
  const [savedQuiz, setSavedQuiz] = useState<{ title: string; questions: unknown[] } | null>(null)
  const [explainSelection, setExplainSelection] = useState("")

  // Listen for explain-text events from LessonActions
  useEffect(() => {
    const cleanup = onExplainEvent(({ selection }) => {
      setExplainSelection(selection)
      setMode("explain")
      setOpen(true)
      setAnswer("")
      setError("")
    })
    return cleanup
  }, [])

  // Auto-run explain when explainSelection changes
  useEffect(() => {
    if (explainSelection && mode === "explain") {
      void run("explain")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explainSelection])

  const quickPrompts = useMemo(() => buildQuickPrompts(mode, content), [mode, content])

  async function run(mode: ChatMode, overrideQuestion?: string) {
    const q = overrideQuestion ?? question
    if (mode === "assistant" && !q.trim()) return

    setLoading(true)
    setError("")
    setAnswer("")

    try {
      const endpoint = mode === "quiz" || mode === "flashcard"
        ? "/api/learn/chat"
        : "/api/learn/assistant"

      const body: Record<string, unknown> =
        mode === "quiz" || mode === "flashcard"
          ? { pageTitle: title, content, count: mode === "quiz" ? quizCount : flashcardCount, mode, language: "Indonesian" }
          : mode === "translate"
          ? { mode: "translate", pageTitle: title, content, translateTo, language: "Indonesian" }
          : mode === "simplify"
          ? { mode: "simplify", pageTitle: title, content, simplifyLevel: "intermediate", language: "Indonesian" }
          : mode === "explain"
          ? { mode: "explain", pageTitle: title, content, selection: explainSelection, language: "Indonesian" }
          : { mode, pageTitle: title, content, question: q, language: "Indonesian" }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Gagal mendapatkan jawaban")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let rawResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        rawResponse += chunk
        setAnswer((prev) => prev + chunk)
      }

      // Auto-save quiz/flashcard after stream completes
      if (mode === "flashcard" || mode === "quiz") {
        try {
          const jsonMatch = rawResponse.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            if (mode === "flashcard") {
              setSavedFlashcards(parsed)
              await saveFlashcards(parsed)
            } else {
              setSavedQuiz({ title: `Kuis - ${title}`, questions: parsed })
              await saveQuiz(parsed)
            }
          }
        } catch {
          // JSON parse might fail, ignore
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  async function saveFlashcards(cards: Array<{ front: string; back: string }>) {
    if (!pageSlug) return
    try {
      await fetch(`/api/learn/flashcards?pageSlug=${pageSlug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageSlug, cards }),
      })
    } catch {
      // silent
    }
  }

  async function saveQuiz(questions: unknown[]) {
    if (!pageSlug) return
    try {
      await fetch(`/api/learn/chat?pageSlug=${pageSlug}&type=quiz`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageSlug, title: `Kuis - ${title}`, questions }),
      })
    } catch {
      // silent
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg"
      >
        {open ? "Tutup AI Tutor" : "Buka AI Tutor"}
      </button>

      {open && (
        <aside className="fixed bottom-20 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] space-y-3 rounded-xl border bg-background p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">AI Tutor — {title}</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>

          {/* Mode selector */}
          <div className="flex flex-wrap gap-1">
            {(Object.keys(MODE_LABELS) as ChatMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m)
                  setAnswer("")
                  setError("")
                  setQuestion("")
                }}
                className={`rounded-md px-2 py-1 text-xs transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "border hover:border-primary"
                }`}
              >
                {MODE_ICONS[m]} {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Mode-specific options */}
          {mode === "translate" && (
            <div className="flex flex-wrap gap-1">
              {TRANSLATE_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setTranslateTo(lang.value)}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    translateTo === lang.value ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}

          {mode === "quiz" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Jumlah soal:</span>
              {QUIZ_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuizCount(n)}
                  className={`rounded-md border px-2 py-0.5 text-xs ${
                    quizCount === n ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {mode === "flashcard" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Jumlah kartu:</span>
              {FLASHCARD_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFlashcardCount(n)}
                  className={`rounded-md border px-2 py-0.5 text-xs ${
                    flashcardCount === n ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {/* Quick prompts */}
          {mode === "assistant" && quickPrompts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setQuestion(prompt)
                    void run("assistant", prompt)
                  }}
                  className="rounded-md border px-2 py-1 text-xs hover:border-primary"
                >
                  {prompt.slice(0, 40)}
                  {prompt.length > 40 ? "..." : ""}
                </button>
              ))}
            </div>
          )}

          {/* Input + submit */}
          {mode === "assistant" && (
            <>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Tanya tentang materi ini..."
                className="min-h-16 w-full rounded-md border bg-background p-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void run("assistant")
                  }
                }}
              />
              <button
                type="button"
                onClick={() => void run("assistant")}
                disabled={loading || !question.trim()}
                className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-60"
              >
                {loading ? "Menjawab..." : "Tanya AI"}
              </button>
            </>
          )}

          {/* Generation buttons */}
          {(mode === "explain" || mode === "simplify" || mode === "translate" || mode === "quiz" || mode === "flashcard") && (
            <button
              type="button"
              onClick={() => void run(mode)}
              disabled={loading}
              className="inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Menghasilkan..." : `🔮 Generate ${MODE_LABELS[mode]}`}
            </button>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          {/* Answer display */}
          {answer && (
            <div className="max-h-72 overflow-y-auto rounded-md border p-3 text-sm whitespace-pre-wrap">
              {answer}
            </div>
          )}

          {/* Saved indicator */}
          {(savedFlashcards.length > 0 || savedQuiz) && (
            <p className="text-xs text-green-600 dark:text-green-400">
              ✅ {savedFlashcards.length > 0 ? `${savedFlashcards.length} flashcard` : ""}{" "}
              {savedFlashcards.length > 0 && savedQuiz ? "dan " : ""}
              {savedQuiz ? "kuis" : ""} disimpan ke database
            </p>
          )}
        </aside>
      )}
    </>
  )
}
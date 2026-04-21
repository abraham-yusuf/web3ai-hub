"use client"

import { useMemo, useState } from "react"

type LearnChatSidebarProps = {
  title: string
  context: string
}

function buildQuickPrompts(context: string): string[] {
  const headings = context
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace("## ", "").trim())
    .slice(0, 3)

  return [
    ...(headings[0] ? [`Jelaskan bagian \"${headings[0]}\" dengan bahasa sederhana.`] : []),
    ...(headings[1] ? [`Apa poin paling penting dari \"${headings[1]}\"?`] : []),
    "Berikan 3 kesalahan umum yang harus dihindari dari materi ini.",
  ]
}

export function LearnChatSidebar({ title, context }: LearnChatSidebarProps) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const quickPrompts = useMemo(() => buildQuickPrompts(context), [context])

  async function ask(customQuestion?: string) {
    const askQuestion = customQuestion ?? question
    if (!askQuestion.trim()) return

    setLoading(true)
    setError("")
    setAnswer("")

    try {
      const response = await fetch("/api/learn/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, context, question: askQuestion }),
      })

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Gagal mendapatkan jawaban")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
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
        <aside className="fixed bottom-20 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] space-y-3 rounded-xl border bg-background p-4 shadow-2xl">
          <h3 className="text-sm font-semibold">AI Tutor — {title}</h3>

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setQuestion(prompt)
                  void ask(prompt)
                }}
                className="rounded-md border px-2 py-1 text-xs hover:border-primary"
              >
                {prompt}
              </button>
            ))}
          </div>

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Tanya tentang materi ini..."
            className="min-h-20 w-full rounded-md border bg-background p-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void ask()}
            disabled={loading}
            className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Menjawab..." : "Tanya"}
          </button>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="max-h-64 overflow-y-auto rounded-md border p-2 text-sm whitespace-pre-wrap">
            {answer || "Jawaban akan muncul di sini..."}
          </div>
        </aside>
      )}
    </>
  )
}

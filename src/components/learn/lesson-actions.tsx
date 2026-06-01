"use client"

import { useEffect, useRef, useState } from "react"
import { emitExplainEvent } from "./learn-events"

const TRANSLATE_LANGS = [
  { label: "🇬🇧 English", value: "English" },
  { label: "🇮🇩 Indonesia", value: "Indonesian" },
  { label: "🇯🇵 日本語", value: "Japanese" },
  { label: "🇨🇳 中文", value: "Chinese" },
]

export function LessonActions({ title, content }: { title: string; content: string }) {
  const [selection, setSelection] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [ttsPlaying, setTtsPlaying] = useState(false)
  const [simplifiedContent, setSimplifiedContent] = useState("")
  const [translatedContent, setTranslatedContent] = useState("")
  const [ttsLang, setTtsLang] = useState("id-ID")
  const [aiLoading, setAiLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
        setShowPopup(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Text selection detection
  useEffect(() => {
    function handleMouseUp() {
      const sel = window.getSelection()
      const text = sel?.toString().trim() ?? ""
      if (text.length > 10 && text.length < 500) {
        const range = sel?.getRangeAt(0)
        if (range) {
          const rect = range.getBoundingClientRect()
          setPopupPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX })
          setSelection(text)
          setShowPopup(true)
        }
      } else {
        setShowPopup(false)
      }
    }
    document.addEventListener("mouseup", handleMouseUp)
    return () => document.removeEventListener("mouseup", handleMouseUp)
  }, [])

  async function handleSimplify(targetLang: string) {
    setActiveMenu(null)
    setAiLoading(true)
    setSimplifiedContent("")
    try {
      const res = await fetch("/api/learn/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "simplify",
          pageTitle: title,
          content,
          language: targetLang,
          simplifyLevel: "intermediate",
        }),
      })
      if (!res.body) throw new Error("No response body")
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setSimplifiedContent((p) => p + dec.decode(value, { stream: true }))
      }
    } catch {
      setSimplifiedContent("Gagal menyederhanakan materi.")
    } finally {
      setAiLoading(false)
    }
  }

  async function handleTranslate(targetLang: string) {
    setActiveMenu(null)
    setAiLoading(true)
    setTranslatedContent("")
    try {
      const res = await fetch("/api/learn/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "translate",
          pageTitle: title,
          content,
          translateTo: targetLang,
          language: targetLang,
        }),
      })
      if (!res.body) throw new Error("No response body")
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setTranslatedContent((p) => p + dec.decode(value, { stream: true }))
      }
    } catch {
      setTranslatedContent("Gagal menerjemahkan materi.")
    } finally {
      setAiLoading(false)
    }
  }

  async function handleTTS() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setTtsPlaying(true)
    try {
      // Strip markdown from content for TTS
      const plainText = content
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, 5000)

      const utterance = new SpeechSynthesisUtterance(
        ttsLang === "id-ID" ? `Judul: ${title}. ${plainText}` : plainText,
      )
      utterance.lang = ttsLang
      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.onend = () => setTtsPlaying(false)
      utterance.onerror = () => setTtsPlaying(false)
      window.speechSynthesis.speak(utterance)
    } catch {
      setTtsPlaying(false)
    }
  }

  function clearResult() {
    setSimplifiedContent("")
    setTranslatedContent("")
  }

  return (
    <>
      {/* Action buttons bar */}
      <div ref={menuRef} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <span className="text-xs font-medium text-muted-foreground">AI Actions:</span>

        {/* Explain selected */}
        <button
          type="button"
          onClick={() => {
            if (selection) emitExplainEvent({ selection, title, content })
          }}
          disabled={!selection}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:border-primary disabled:opacity-40"
        >
          🔍 Jelaskan Teks
        </button>

        {/* Simplify */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === "simplify" ? null : "simplify")}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:border-primary"
          >
            📖 Sederhanakan {activeMenu === "simplify" ? "▲" : "▼"}
          </button>
          {activeMenu === "simplify" && (
            <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-md border bg-background p-1 shadow-lg">
              <p className="px-2 py-1 text-xs font-medium">Bahasa:</p>
              {["Indonesian", "English"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => void handleSimplify(l)}
                  className="w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Translate */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === "translate" ? null : "translate")}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:border-primary"
          >
            🌐 Terjemahkan {activeMenu === "translate" ? "▲" : "▼"}
          </button>
          {activeMenu === "translate" && (
            <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-md border bg-background p-1 shadow-lg">
              <p className="px-2 py-1 text-xs font-medium">Terjemahkan ke:</p>
              {TRANSLATE_LANGS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => {
                    void handleTranslate(l.value)
                  }}
                  className="w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TTS Language selector */}
        <select
          value={ttsLang}
          onChange={(e) => setTtsLang(e.target.value)}
          className="rounded-md border bg-background px-1 py-1 text-xs"
        >
          <option value="id-ID">🇮🇩 ID</option>
          <option value="en-US">🇬🇧 EN</option>
          <option value="ja-JP">🇯🇵 JP</option>
          <option value="zh-CN">🇨🇳 ZH</option>
        </select>

        {/* TTS */}
        <button
          type="button"
          onClick={() => void handleTTS()}
          disabled={ttsPlaying}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:border-primary disabled:opacity-60"
        >
          🔊 {ttsPlaying ? "Memutar..." : "Dengarkan"}
        </button>

        {/* Clear results */}
        {(simplifiedContent || translatedContent) && (
          <button
            type="button"
            onClick={clearResult}
            className="rounded-md border border-destructive/50 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
          >
            ✕ Clear
          </button>
        )}

        {aiLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">
            🔮 AI memproses...
          </span>
        )}
      </div>

      {/* Simplified / Translated result panel */}
      {(simplifiedContent || translatedContent) && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
          <p className="text-xs font-semibold text-primary">
            {simplifiedContent ? "📖 Materi Tersederhanakan" : "🌐 Terjemahan"}
          </p>
          <div className="prose prose-zinc max-w-none text-sm dark:prose-invert whitespace-pre-wrap">
            {simplifiedContent || translatedContent}
          </div>
        </div>
      )}

      {/* Selection explain popup */}
      {showPopup && (
        <div
          className="fixed z-50 rounded-lg border bg-background px-3 py-2 shadow-xl"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <button
            type="button"
            onClick={() => {
                            emitExplainEvent({ selection, title, content })
                            setShowPopup(false)
                          }}
            className="flex items-center gap-2 text-sm hover:text-primary"
          >
            🔍 Jelaskan: &ldquo;{selection.slice(0, 40)}...&rdquo;
          </button>
        </div>
      )}
    </>
  )
}
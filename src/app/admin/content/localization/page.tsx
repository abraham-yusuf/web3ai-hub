"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Languages, RefreshCw, ArrowRightLeft, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type Language = "id" | "en"
type Direction = "id-en" | "en-id"

type HistoryEntry = {
  id: string
  original: string
  translated: string
  from: Language
  to: Language
  createdAt: string
}

const HISTORY_KEY = "localization-history-v1"
const MAX_HISTORY = 10

const LANGUAGE_LABELS: Record<Language, string> = {
  id: "Bahasa Indonesia",
  en: "English",
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function parseHistory(value: string | null): HistoryEntry[] {
  if (!value) return []
  try {
    return JSON.parse(value) as HistoryEntry[]
  } catch {
    return []
  }
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
}

export default function AdminLocalizationPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [direction, setDirection] = useState<Direction>("id-en")
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkResults, setBulkResults] = useState<string[]>([])
  const [bulkIndex, setBulkIndex] = useState(-1)

  const fromLang = useMemo<Language>(() => (direction === "id-en" ? "id" : "en"), [direction])
  const toLang = useMemo<Language>(() => (direction === "id-en" ? "en" : "id"), [direction])

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY)
    setHistory(parseHistory(stored))
  }, [])

  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    const trimmed = entries.slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
    setHistory(trimmed)
  }, [])

  function toggleDirection() {
    setDirection((prev) => (prev === "id-en" ? "en-id" : "id-en"))
    setInput("")
    setOutput("")
    setError("")
    setBulkResults([])
    setBulkIndex(-1)
  }

  async function handleTranslate() {
    if (!input.trim()) return
    setIsTranslating(true)
    setError("")
    setOutput("")

    try {
      const res = await fetch("/api/content/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, from: fromLang, to: toLang }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      const data = await res.json()
      setOutput(data.translated)

      const entry: HistoryEntry = {
        id: createId(),
        original: input,
        translated: data.translated,
        from: fromLang,
        to: toLang,
        createdAt: new Date().toISOString(),
      }
      saveHistory([entry, ...history])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed")
    } finally {
      setIsTranslating(false)
    }
  }

  async function handleBulkTranslate() {
    const paragraphs = splitParagraphs(input)
    if (paragraphs.length === 0) return

    setIsTranslating(true)
    setError("")
    setBulkResults([])
    setBulkIndex(0)

    const results: string[] = []

    try {
      for (let i = 0; i < paragraphs.length; i++) {
        setBulkIndex(i)
        const res = await fetch("/api/content/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: paragraphs[i], from: fromLang, to: toLang }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Request failed at paragraph ${i + 1} (${res.status})`)
        }

        const data = await res.json()
        results.push(data.translated)
        setBulkResults([...results])
      }

      if (results.length > 0) {
        setOutput(results.join("\n\n"))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk translation failed")
    } finally {
      setIsTranslating(false)
      setBulkIndex(-1)
    }
  }

  async function handleCopy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleApply() {
    if (!output) return
    const notice =
      "To apply this translation, create or update a post with the translated content. " +
      "The translated text is in your clipboard."
    navigator.clipboard.writeText(output)
    alert(notice)
  }

  function loadFromHistory(entry: HistoryEntry) {
    setInput(entry.original)
    setOutput(entry.translated)
    setDirection(entry.from === "id" ? "id-en" : "en-id")
  }

  function clearHistory() {
    saveHistory([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Languages className="h-8 w-8" />
            Content Localization
          </h1>
          <p className="text-muted-foreground mt-1">
            Translate content between Bahasa Indonesia and English
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkMode((prev) => !prev)}
          >
            {bulkMode ? "Single Mode" : "Bulk Mode"}
          </Button>
        </div>
      </div>

      {/* Direction Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{LANGUAGE_LABELS[fromLang]}</span>
        <Button variant="ghost" size="icon" onClick={toggleDirection} title="Swap direction">
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{LANGUAGE_LABELS[toLang]}</span>
        <span className="ml-2 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          {direction === "id-en" ? "ID → EN" : "EN → ID"}
        </span>
      </div>

      {/* Main Panels */}
      <div className={cn("grid gap-6", bulkMode ? "grid-rows-2" : "grid-cols-2")}>
        {/* Input Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Original Text</label>
            {bulkMode && bulkResults.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {bulkResults.length} of {splitParagraphs(input).length} paragraphs translated
              </span>
            )}
          </div>
          <textarea
            className="min-h-[300px] w-full rounded-lg border bg-background p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder={`Paste ${LANGUAGE_LABELS[fromLang]} content here...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTranslating}
          />
          <div className="flex gap-2">
            <Button onClick={bulkMode ? handleBulkTranslate : handleTranslate} disabled={isTranslating || !input.trim()}>
              {isTranslating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {bulkMode && bulkIndex >= 0 ? `Translating paragraph ${bulkIndex + 1}...` : "Translating..."}
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  {bulkMode ? "Translate All" : "Translate"}
                </>
              )}
            </Button>
            {input && (
              <Button variant="outline" onClick={() => { setInput(""); setOutput(""); setError(""); setBulkResults([]); setBulkIndex(-1); }}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Translated Text</label>
            {output && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleApply}>
                  <Plus className="mr-1 h-3 w-3" />
                  Apply
                </Button>
              </div>
            )}
          </div>
          <textarea
            className="min-h-[300px] w-full rounded-lg border bg-muted/30 p-3 text-sm font-mono focus:outline-none resize-y"
            placeholder="Translation will appear here..."
            value={bulkMode ? bulkResults.join("\n\n") : output}
            readOnly
          />
        </div>
      </div>

      {/* Bulk Progress */}
      {bulkMode && bulkIndex >= 0 && splitParagraphs(input).length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{bulkIndex + 1} / {splitParagraphs(input).length}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${((bulkIndex + 1) / splitParagraphs(input).length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Translations</h2>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Clear history
            </Button>
          </div>
          <div className="space-y-2">
            {history.map((entry) => (
              <button
                key={entry.id}
                className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                onClick={() => loadFromHistory(entry)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {LANGUAGE_LABELS[entry.from]} → {LANGUAGE_LABELS[entry.to]}
                    {" · "}
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm line-clamp-1">{entry.original}</p>
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">→ {entry.translated}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
import { components as mdxComponents } from "@/components/mdx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AIProvider, AIWriterAction, AIWriterRequest, WriterTone } from "@/lib/ai/types"

type WriterTemplate = AIWriterRequest["template"]
type WriterLength = AIWriterRequest["length"]

type TemplateOption = {
  id: WriterTemplate
  label: string
  description: string
  recommendedTone: WriterTone
  recommendedLength: WriterLength
}

type PromptHistoryEntry = {
  id: string
  topic: string
  language: string
  tone: WriterTone
  length: WriterLength
  template: WriterTemplate
  provider: AIProvider
  model: string
  createdAt: string
}

type MetadataDraft = {
  title: string
  excerpt: string
  tags: string[]
}

type ViewMode = "editor" | "preview" | "split"

type SlashState = {
  query: string
  start: number
  end: number
  index: number
}

type SelectionRange = {
  start: number
  end: number
  text: string
}

type DraftPayload = {
  topic: string
  language: string
  tone: WriterTone
  length: WriterLength
  template: WriterTemplate
  provider: AIProvider
  model: string
  content: string
  metadata: MetadataDraft
}

type SlashCommand = {
  id: string
  label: string
  description: string
  action: AIWriterAction
  requiresSelection?: boolean
}

type CollabMessage = {
  originId: string
  updatedAt: number
  payload: DraftPayload
}

const DRAFT_STORAGE_KEY = "ai-writer-draft-v2"
const HISTORY_STORAGE_KEY = "ai-writer-history-v1"
const COLLAB_STORAGE_KEY = "ai-writer-collab-enabled"

const providerModels: Record<AIProvider, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4.1-mini"],
  anthropic: ["claude-3-5-haiku-latest", "claude-3-7-sonnet-latest"],
  google: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-3-flash-preview"],
  groq: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"],
  nvidia: ["nvidia/llama-3.1-405b-instruct", "meta/llama-3.1-70b-instruct", "deepseek-ai/deepseek-v4-pro"],
}

const templateLibrary: TemplateOption[] = [
  {
    id: "tutorial",
    label: "Tutorial Praktis",
    description: "Langkah demi langkah, cocok untuk edukasi teknikal dengan checklist.",
    recommendedTone: "educational",
    recommendedLength: "medium",
  },
  {
    id: "opinion",
    label: "Opini & Insight",
    description: "Argumentatif, fokus pada sudut pandang dan reasoning.",
    recommendedTone: "professional",
    recommendedLength: "medium",
  },
  {
    id: "news",
    label: "News Summary",
    description: "Ringkasan cepat berita, dampak, dan konteks market.",
    recommendedTone: "technical",
    recommendedLength: "short",
  },
  {
    id: "tool-review",
    label: "Tool Review",
    description: "Ulasan fitur, pricing, dan use-case untuk pembaca.",
    recommendedTone: "professional",
    recommendedLength: "medium",
  },
  {
    id: "airdrop-guide",
    label: "Airdrop Guide",
    description: "Panduan airdrop dengan checklist dan disclaimer risiko.",
    recommendedTone: "educational",
    recommendedLength: "long",
  },
]

const slashCommands: SlashCommand[] = [
  {
    id: "summarize",
    label: "Summarize",
    description: "Ringkas draft menjadi 3-5 kalimat.",
    action: "summarize",
  },
  {
    id: "seo",
    label: "SEO Optimizer",
    description: "Audit keyword, heading, dan internal linking.",
    action: "seo-optimize",
  },
  {
    id: "title",
    label: "Title Generator",
    description: "Buat 5 opsi judul.",
    action: "title",
  },
  {
    id: "tags",
    label: "Tags Generator",
    description: "Buat daftar tag relevan.",
    action: "tags",
  },
  {
    id: "excerpt",
    label: "Excerpt Generator",
    description: "Buat ringkasan meta description.",
    action: "excerpt",
  },
  {
    id: "regenerate",
    label: "Regenerate Section",
    description: "Perbaiki section yang sedang dipilih.",
    action: "regenerate-section",
    requiresSelection: true,
  },
]

function PreviewCodeBlock({ children }: { children?: ReactNode }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm text-zinc-100">
      <code>{children}</code>
    </pre>
  )
}

function parseListLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.replace(/^\s*[-*\d.]+\s*/g, "").trim())
    .filter(Boolean)
}

function parseTags(raw: string): string[] {
  return raw
    .split(/[,\n]/g)
    .map((tag) => tag.replace(/^\s*[-*\d.]+\s*/g, "").trim())
    .filter(Boolean)
}

function formatYamlString(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  return `"${escaped}"`
}

function formatYamlTags(tags: string[]): string {
  const formatted = tags.map((tag) => formatYamlString(tag))
  return `[${formatted.join(", ")}]`
}

function upsertFrontmatter(content: string, metadata: MetadataDraft): string {
  const updates: Array<[keyof MetadataDraft, string | string[]]> = [
    ["title", metadata.title],
    ["excerpt", metadata.excerpt],
    ["tags", metadata.tags],
  ]

  const match = /^---\n([\s\S]*?)\n---\n?/.exec(content)
  const existing = match?.[1] ?? ""
  let nextFrontmatter = existing.trim()

  const upsertField = (key: string, value: string) => {
    const lineRegex = new RegExp(`^${key}:.*$`, "m")
    if (lineRegex.test(nextFrontmatter)) {
      nextFrontmatter = nextFrontmatter.replace(lineRegex, `${key}: ${value}`)
    } else {
      nextFrontmatter = nextFrontmatter ? `${nextFrontmatter}\n${key}: ${value}` : `${key}: ${value}`
    }
  }

  updates.forEach(([key, value]) => {
    if (typeof value === "string" && !value.trim()) return
    if (Array.isArray(value) && value.length === 0) return
    if (key === "tags" && Array.isArray(value)) {
      upsertField("tags", formatYamlTags(value))
      return
    }
    if (typeof value === "string") {
      upsertField(key, formatYamlString(value))
    }
  })

  if (!nextFrontmatter) {
    return content
  }

  const body = match ? content.slice(match[0].length) : content
  return `---\n${nextFrontmatter}\n---\n\n${body.trimStart()}`
}

function buildSlashState(value: string, cursor: number): SlashState | null {
  const prefix = value.slice(0, cursor)
  const match = /(?:^|\s)\/([a-z-]*)$/i.exec(prefix)
  if (!match) return null
  const query = match[1] ?? ""
  return {
    query,
    start: cursor - query.length - 1,
    end: cursor,
    index: 0,
  }
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\n?/, "")
}

function parseStoredJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function AdminAIWriterPage() {
  const initialDraft = useMemo(() => {
    if (typeof window === "undefined") return null
    return parseStoredJson<DraftPayload | null>(localStorage.getItem(DRAFT_STORAGE_KEY), null)
  }, [])
  const initialHistory = useMemo(() => {
    if (typeof window === "undefined") return []
    return parseStoredJson<PromptHistoryEntry[]>(localStorage.getItem(HISTORY_STORAGE_KEY), [])
  }, [])
  const initialCollab = useMemo(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(COLLAB_STORAGE_KEY) === "true"
  }, [])
  const initialProvider = initialDraft?.provider ?? "openai"
  const initialModelCandidate = initialDraft?.model ?? providerModels[initialProvider][0]
  const initialModel = providerModels[initialProvider].includes(initialModelCandidate)
    ? initialModelCandidate
    : providerModels[initialProvider][0]
  const initialMetadata = initialDraft?.metadata ?? { title: "", excerpt: "", tags: [] }

  const [topic, setTopic] = useState(() => initialDraft?.topic ?? "")
  const [language, setLanguage] = useState(() => initialDraft?.language ?? "Bahasa Indonesia")
  const [tone, setTone] = useState<WriterTone>(() => initialDraft?.tone ?? "educational")
  const [length, setLength] = useState<WriterLength>(() => initialDraft?.length ?? "medium")
  const [template, setTemplate] = useState<WriterTemplate>(() => initialDraft?.template ?? "tutorial")
  const [provider, setProvider] = useState<AIProvider>(initialProvider)
  const [model, setModel] = useState(initialModel)
  const [content, setContent] = useState(() => initialDraft?.content ?? "")
  const [metadata, setMetadata] = useState<MetadataDraft>(initialMetadata)
  const [tagsInput, setTagsInput] = useState(() => initialMetadata.tags.join(", "))
  const [summary, setSummary] = useState("")
  const [seoNotes, setSeoNotes] = useState("")
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [sectionDraft, setSectionDraft] = useState("")
  const [regenerateInstruction, setRegenerateInstruction] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [previewSource, setPreviewSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [previewError, setPreviewError] = useState("")
  const [history, setHistory] = useState<PromptHistoryEntry[]>(initialHistory)
  const [collabEnabled, setCollabEnabled] = useState(initialCollab)
  const [collabStatus, setCollabStatus] = useState("")
  const [activeAction, setActiveAction] = useState<AIWriterAction | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAssistantBusy, setIsAssistantBusy] = useState(false)
  const [error, setError] = useState("")
  const [selection, setSelection] = useState<SelectionRange | null>(null)
  const [slashState, setSlashState] = useState<SlashState | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const collabChannelRef = useRef<BroadcastChannel | null>(null)
  const collabIdRef = useRef<string>(createId())
  const applyingRemoteRef = useRef(false)
  const previewTimerRef = useRef<number | null>(null)

  const availableModels = useMemo(() => providerModels[provider], [provider])
  const previewComponents = useMemo(() => ({ ...mdxComponents, CodeBlock: PreviewCodeBlock }), [])
  const canGenerate = topic.trim().length >= 4 && !isGenerating
  const contentReady = content.trim().length >= 20
  const filteredCommands = useMemo(() => {
    if (!slashState) return []
    return slashCommands.filter((command) => command.id.startsWith(slashState.query))
  }, [slashState])

  const handleProviderChange = useCallback((nextProvider: AIProvider, nextModel?: string) => {
    const models = providerModels[nextProvider]
    const resolvedModel = nextModel && models.includes(nextModel) ? nextModel : models[0]
    setProvider(nextProvider)
    setModel(resolvedModel)
  }, [])

  const schedulePreview = useCallback(
    (nextContent: string, nextViewMode = viewMode) => {
      if (nextViewMode === "editor") {
        return
      }
      if (previewTimerRef.current) {
        window.clearTimeout(previewTimerRef.current)
      }
      if (!nextContent.trim()) {
        setPreviewSource(null)
        setPreviewError("")
        return
      }
      previewTimerRef.current = window.setTimeout(() => {
        serialize(stripFrontmatter(nextContent))
          .then((result) => {
            setPreviewSource(result)
            setPreviewError("")
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : "Gagal menampilkan preview."
            setPreviewError(message)
          })
      }, 400)
    },
    [viewMode],
  )

  useEffect(() => {
    const handler = window.setTimeout(() => {
      const payload: DraftPayload = {
        topic,
        language,
        tone,
        length,
        template,
        provider,
        model,
        content,
        metadata,
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
      localStorage.setItem(COLLAB_STORAGE_KEY, String(collabEnabled))
    }, 700)

    return () => window.clearTimeout(handler)
  }, [topic, language, tone, length, template, provider, model, content, metadata, collabEnabled])

  useEffect(() => {
    if (!collabEnabled || typeof window === "undefined") {
      collabChannelRef.current?.close()
      collabChannelRef.current = null
      return
    }

    if (typeof BroadcastChannel === "undefined") {
      return
    }

    const channel = new BroadcastChannel("ai-writer-collab")
    collabChannelRef.current = channel

    channel.onmessage = (event: MessageEvent<CollabMessage>) => {
      const message = event.data
      if (!message || message.originId === collabIdRef.current) return
      applyingRemoteRef.current = true
      setTopic(message.payload.topic)
      setLanguage(message.payload.language)
      setTone(message.payload.tone)
      setLength(message.payload.length)
      setTemplate(message.payload.template)
      handleProviderChange(message.payload.provider, message.payload.model)
      setContent(message.payload.content)
      schedulePreview(message.payload.content)
      setMetadata(message.payload.metadata)
      setTagsInput(message.payload.metadata.tags.join(", "))
      setCollabStatus(`Draft diperbarui dari sesi lain • ${new Date(message.updatedAt).toLocaleTimeString()}`)
      window.setTimeout(() => {
        applyingRemoteRef.current = false
      }, 0)
    }

    return () => {
      channel.close()
      collabChannelRef.current = null
    }
  }, [collabEnabled, handleProviderChange, schedulePreview])

  useEffect(() => {
    if (!collabEnabled || applyingRemoteRef.current) return
    const handler = window.setTimeout(() => {
      const payload: DraftPayload = {
        topic,
        language,
        tone,
        length,
        template,
        provider,
        model,
        content,
        metadata,
      }
      collabChannelRef.current?.postMessage({
        originId: collabIdRef.current,
        updatedAt: Date.now(),
        payload,
      } satisfies CollabMessage)
    }, 800)

    return () => window.clearTimeout(handler)
  }, [topic, language, tone, length, template, provider, model, content, metadata, collabEnabled])

  function updateSelection() {
    const element = textareaRef.current
    if (!element) return
    const start = element.selectionStart ?? 0
    const end = element.selectionEnd ?? 0
    if (start === end) {
      setSelection(null)
      return
    }
    setSelection({
      start,
      end,
      text: element.value.slice(start, end),
    })
  }

  function handleContentChange(value: string) {
    setContent(value)
    schedulePreview(value)
    const element = textareaRef.current
    const cursor = element?.selectionStart ?? value.length
    setSlashState(buildSlashState(value, cursor))
  }

  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode)
    schedulePreview(content, mode)
  }

  function handleCollabToggle(enabled: boolean) {
    if (enabled && typeof BroadcastChannel === "undefined") {
      setCollabStatus("Browser tidak mendukung collaborative editing.")
      return
    }
    setCollabEnabled(enabled)
    if (!enabled) {
      setCollabStatus("")
    }
  }

  function removeSlashCommand(state: SlashState) {
    setContent((prev) => {
      const nextValue = prev.slice(0, state.start) + prev.slice(state.end)
      window.requestAnimationFrame(() => {
        const element = textareaRef.current
        if (!element) return
        element.selectionStart = state.start
        element.selectionEnd = state.start
      })
      return nextValue
    })
  }

  function applyMetadata() {
    if (!content.trim()) return
    setContent((prev) => {
      const nextValue = upsertFrontmatter(prev, metadata)
      schedulePreview(nextValue)
      return nextValue
    })
  }

  function saveHistoryEntry() {
    const entry: PromptHistoryEntry = {
      id: createId(),
      topic,
      language,
      tone,
      length,
      template,
      provider,
      model,
      createdAt: new Date().toISOString(),
    }
    const nextHistory = [entry, ...history].slice(0, 8)
    setHistory(nextHistory)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory))
  }

  async function streamAction(
    action: AIWriterAction,
    payload: Record<string, unknown>,
    onChunk: (chunk: string) => void,
  ) {
    setError("")
    const response = await fetch("/api/admin/ai/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        provider,
        model,
        ...payload,
      }),
    })

    if (!response.ok || !response.body) {
      const fallback = await response.json().catch(() => ({}))
      throw new Error(fallback.error ?? "Gagal memproses permintaan.")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      onChunk(decoder.decode(value, { stream: true }))
    }
  }

  async function handleGenerate() {
    setIsGenerating(true)
    setActiveAction("generate")
    setContent("")
    schedulePreview("")
    saveHistoryEntry()

    try {
      await streamAction(
        "generate",
        {
          topic,
          language,
          tone,
          length,
          template,
        },
        (chunk) => {
          setContent((prev) => {
            const nextValue = prev + chunk
            schedulePreview(nextValue)
            return nextValue
          })
        },
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setIsGenerating(false)
      setActiveAction(null)
    }
  }

  async function handleSummarize() {
    if (!contentReady) return
    setIsAssistantBusy(true)
    setActiveAction("summarize")
    setSummary("")

    try {
      await streamAction(
        "summarize",
        { content, language },
        (chunk) => setSummary((prev) => prev + chunk),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat ringkasan.")
    } finally {
      setIsAssistantBusy(false)
      setActiveAction(null)
    }
  }

  async function handleSeo() {
    if (!contentReady) return
    setIsAssistantBusy(true)
    setActiveAction("seo-optimize")
    setSeoNotes("")

    try {
      await streamAction(
        "seo-optimize",
        { content, language },
        (chunk) => setSeoNotes((prev) => prev + chunk),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menjalankan SEO optimizer.")
    } finally {
      setIsAssistantBusy(false)
      setActiveAction(null)
    }
  }

  async function handleTitle() {
    if (!contentReady) return
    setIsAssistantBusy(true)
    setActiveAction("title")
    setTitleSuggestions([])

    let buffer = ""
    try {
      await streamAction(
        "title",
        { content, language },
        (chunk) => {
          buffer += chunk
          setTitleSuggestions(parseListLines(buffer))
        },
      )
      const parsed = parseListLines(buffer)
      if (parsed.length > 0) {
        setMetadata((prev) => ({ ...prev, title: parsed[0] }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat judul.")
    } finally {
      setIsAssistantBusy(false)
      setActiveAction(null)
    }
  }

  async function handleTags() {
    if (!contentReady) return
    setIsAssistantBusy(true)
    setActiveAction("tags")
    setTagSuggestions([])

    let buffer = ""
    try {
      await streamAction(
        "tags",
        { content, language },
        (chunk) => {
          buffer += chunk
          const parsed = parseTags(buffer)
          setTagSuggestions(parsed)
        },
      )
      const parsed = parseTags(buffer)
      if (parsed.length > 0) {
        setMetadata((prev) => ({ ...prev, tags: parsed }))
        setTagsInput(parsed.join(", "))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat tag.")
    } finally {
      setIsAssistantBusy(false)
      setActiveAction(null)
    }
  }

  async function handleExcerpt() {
    if (!contentReady) return
    setIsAssistantBusy(true)
    setActiveAction("excerpt")
    setMetadata((prev) => ({ ...prev, excerpt: "" }))

    try {
      await streamAction(
        "excerpt",
        { content, language },
        (chunk) => setMetadata((prev) => ({ ...prev, excerpt: prev.excerpt + chunk })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat excerpt.")
    } finally {
      setIsAssistantBusy(false)
      setActiveAction(null)
    }
  }

  async function handleRegenerateSection() {
    if (!selection || !contentReady) return
    setIsAssistantBusy(true)
    setActiveAction("regenerate-section")
    setSectionDraft("")

    try {
      await streamAction(
        "regenerate-section",
        {
          content,
          selection: selection.text,
          instruction: regenerateInstruction,
          language,
        },
        (chunk) => setSectionDraft((prev) => prev + chunk),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbaiki section.")
    } finally {
      setIsAssistantBusy(false)
      setActiveAction(null)
    }
  }

  function applySectionDraft() {
    if (!selection || !sectionDraft.trim()) return
    setContent((prev) => {
      const nextValue = prev.slice(0, selection.start) + sectionDraft + prev.slice(selection.end)
      schedulePreview(nextValue)
      return nextValue
    })
    setSectionDraft("")
  }

  function handleSlashCommand(command: SlashCommand) {
    if (!slashState) return
    if (command.requiresSelection && !selection) {
      setError("Pilih bagian teks terlebih dahulu untuk command ini.")
      return
    }
    removeSlashCommand(slashState)
    if (command.action === "summarize") {
      void handleSummarize()
    } else if (command.action === "seo-optimize") {
      void handleSeo()
    } else if (command.action === "title") {
      void handleTitle()
    } else if (command.action === "tags") {
      void handleTags()
    } else if (command.action === "excerpt") {
      void handleExcerpt()
    } else {
      void handleRegenerateSection()
    }
    setSlashState(null)
  }

  function handleSlashKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!slashState || filteredCommands.length === 0) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setSlashState((prev) =>
        prev ? { ...prev, index: Math.min(prev.index + 1, filteredCommands.length - 1) } : prev,
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setSlashState((prev) => (prev ? { ...prev, index: Math.max(prev.index - 1, 0) } : prev))
    } else if (event.key === "Enter") {
      event.preventDefault()
      const command = filteredCommands[slashState.index]
      if (command) {
        handleSlashCommand(command)
      }
    } else if (event.key === "Escape") {
      setSlashState(null)
    }
  }

  function handleTagsInputChange(value: string) {
    setTagsInput(value)
    setMetadata((prev) => ({ ...prev, tags: parseTags(value) }))
  }

  const renderPreview = (
    <div className="prose prose-zinc max-w-none dark:prose-invert">
      {previewError ? (
        <p className="text-sm text-destructive">{previewError}</p>
      ) : previewSource ? (
        <MDXRemote {...previewSource} components={previewComponents} />
      ) : (
        <p className="text-sm text-muted-foreground">Preview akan muncul setelah ada konten.</p>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">AI Writer</h1>
          <p className="text-muted-foreground">AI-first workspace untuk generate, edit, dan optimasi artikel.</p>
        </div>
        <a href="/admin/settings" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
          AI Settings
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-5 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topik</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Contoh: Strategi DeFi untuk pemula"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Bahasa</Label>
            <Input id="language" value={language} onChange={(event) => setLanguage(event.target.value)} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <select
                id="tone"
                value={tone}
                onChange={(event) => setTone(event.target.value as WriterTone)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="educational">Educational</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Panjang</Label>
              <select
                id="length"
                value={length}
                onChange={(event) => setLength(event.target.value as WriterLength)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template">Template Prompt</Label>
              <select
                id="template"
                value={template}
                onChange={(event) => setTemplate(event.target.value as WriterTemplate)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                {templateLibrary.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                value={provider}
                onChange={(event) => handleProviderChange(event.target.value as AIProvider)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="groq">Groq</option>
                <option value="nvidia">NVIDIA</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <select
              id="model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              {availableModels.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <Button type="button" onClick={handleGenerate} disabled={!canGenerate}>
            {isGenerating ? "Generating..." : "Generate Draft"}
          </Button>

          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold">Template Library</p>
            <div className="space-y-2">
              {templateLibrary.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTemplate(option.id)
                    setTone(option.recommendedTone)
                    setLength(option.recommendedLength)
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    template === option.id ? "border-primary bg-primary/10" : "hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold">Prompt History</p>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada prompt yang tersimpan.</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <div key={entry.id} className="rounded-lg border px-3 py-2 text-sm">
                    <p className="font-medium">{entry.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.template} • {entry.tone} • {entry.length} • {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTopic(entry.topic)
                          setLanguage(entry.language)
                          setTone(entry.tone)
                          setLength(entry.length)
                          setTemplate(entry.template)
                          handleProviderChange(entry.provider, entry.model)
                        }}
                      >
                        Use
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const nextHistory = history.filter((item) => item.id !== entry.id)
                          setHistory(nextHistory)
                          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory))
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Autosave Draft</span>
              <span className="text-xs text-muted-foreground">Aktif</span>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={collabEnabled}
                onChange={(event) => handleCollabToggle(event.target.checked)}
              />
              Kolaborasi real-time (sync antar tab)
            </label>
            {collabStatus && <p className="text-xs text-muted-foreground">{collabStatus}</p>}
          </div>
        </section>

        <div className="space-y-6">
          <section className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">Draft Workspace</h2>
                <p className="text-xs text-muted-foreground">
                  {activeAction ? `Sedang menjalankan: ${activeAction}` : "Gunakan / untuk slash command."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={viewMode === "editor" ? "secondary" : "outline"} onClick={() => handleViewModeChange("editor")}>
                  Editor
                </Button>
                <Button type="button" size="sm" variant={viewMode === "split" ? "secondary" : "outline"} onClick={() => handleViewModeChange("split")}>
                  Split
                </Button>
                <Button type="button" size="sm" variant={viewMode === "preview" ? "secondary" : "outline"} onClick={() => handleViewModeChange("preview")}>
                  Preview
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(content)} disabled={!content}>
                  Copy
                </Button>
                <a
                  href={`/admin/posts/new?title=${encodeURIComponent(metadata.title || topic)}&content=${encodeURIComponent(content)}`}
                  className="inline-flex h-7 items-center rounded-md border px-3 text-xs font-medium"
                >
                  Insert to Editor
                </a>
                <a
                  href={`/admin/learn/new?title=${encodeURIComponent(metadata.title || topic)}&content=${encodeURIComponent(content)}`}
                  className="inline-flex h-7 items-center rounded-md border border-primary px-3 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  Insert to Learn
                </a>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {viewMode === "editor" && (
              <div className="relative space-y-2">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(event) => handleContentChange(event.target.value)}
                  onSelect={updateSelection}
                  onKeyUp={updateSelection}
                  onMouseUp={updateSelection}
                  onKeyDown={handleSlashKeyDown}
                  className="min-h-[520px] w-full rounded-md border bg-background p-3 font-mono text-sm"
                  placeholder="Mulai menulis atau gunakan tombol Generate..."
                />

                {slashState && filteredCommands.length > 0 && (
                  <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
                    {filteredCommands.map((command, index) => (
                      <button
                        key={command.id}
                        type="button"
                        onClick={() => handleSlashCommand(command)}
                        className={`flex w-full flex-col gap-1 rounded-md px-2 py-1.5 text-left ${
                          slashState.index === index ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        }`}
                      >
                        <span className="font-medium">{command.label}</span>
                        <span className="text-xs text-muted-foreground">{command.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === "preview" && renderPreview}

            {viewMode === "split" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="relative space-y-2">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(event) => handleContentChange(event.target.value)}
                    onSelect={updateSelection}
                    onKeyUp={updateSelection}
                    onMouseUp={updateSelection}
                    onKeyDown={handleSlashKeyDown}
                    className="min-h-[520px] w-full rounded-md border bg-background p-3 font-mono text-sm"
                    placeholder="Mulai menulis atau gunakan tombol Generate..."
                  />
                  {slashState && filteredCommands.length > 0 && (
                    <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
                      {filteredCommands.map((command, index) => (
                        <button
                          key={command.id}
                          type="button"
                          onClick={() => handleSlashCommand(command)}
                          className={`flex w-full flex-col gap-1 rounded-md px-2 py-1.5 text-left ${
                            slashState.index === index ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-medium">{command.label}</span>
                          <span className="text-xs text-muted-foreground">{command.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-md border bg-background p-3">{renderPreview}</div>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">AI Assistant Tools</h3>
                <p className="text-xs text-muted-foreground">Optimasi konten, metadata, dan section.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" disabled={!contentReady || isAssistantBusy} onClick={handleSummarize}>
                  Summarize
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={!contentReady || isAssistantBusy} onClick={handleSeo}>
                  SEO Optimizer
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={!contentReady || isAssistantBusy} onClick={handleTitle}>
                  Generate Title
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={!contentReady || isAssistantBusy} onClick={handleTags}>
                  Generate Tags
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={!contentReady || isAssistantBusy} onClick={handleExcerpt}>
                  Generate Excerpt
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-sm font-semibold">Metadata</p>
                <div className="space-y-2">
                  <Label htmlFor="meta-title">Judul</Label>
                  <Input
                    id="meta-title"
                    value={metadata.title}
                    onChange={(event) => setMetadata((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Judul artikel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-excerpt">Excerpt</Label>
                  <textarea
                    id="meta-excerpt"
                    value={metadata.excerpt}
                    onChange={(event) => setMetadata((prev) => ({ ...prev, excerpt: event.target.value }))}
                    className="min-h-[96px] w-full rounded-md border bg-background p-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-tags">Tags</Label>
                  <Input
                    id="meta-tags"
                    value={tagsInput}
                    onChange={(event) => handleTagsInputChange(event.target.value)}
                    placeholder="web3, ai, tutorial"
                  />
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={applyMetadata} disabled={!content.trim()}>
                  Apply ke Frontmatter
                </Button>
              </div>

              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-sm font-semibold">Summary</p>
                <p className="min-h-[96px] text-sm text-muted-foreground whitespace-pre-wrap">
                  {summary || "Ringkasan akan muncul di sini."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!summary}
                    onClick={() => navigator.clipboard.writeText(summary)}
                  >
                    Copy Summary
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!summary}
                    onClick={() => setMetadata((prev) => ({ ...prev, excerpt: summary }))}
                  >
                    Use as Excerpt
                  </Button>
                </div>
              </div>
            </div>

            {titleSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Title Suggestions</p>
                <div className="flex flex-col gap-2">
                  {titleSuggestions.map((title) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => setMetadata((prev) => ({ ...prev, title }))}
                      className="rounded-md border px-3 py-2 text-left text-sm hover:border-primary/50"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tagSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Tag Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (metadata.tags.includes(tag)) return
                        const nextTags = [...metadata.tags, tag]
                        setMetadata((prev) => ({ ...prev, tags: nextTags }))
                        setTagsInput(nextTags.join(", "))
                      }}
                      className="rounded-full border px-3 py-1 text-xs hover:border-primary/50"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-semibold">SEO Optimizer</p>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{seoNotes || "Jalankan SEO optimizer untuk melihat rekomendasi."}</div>
              {seoNotes && (
                <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(seoNotes)}>
                  Copy SEO Notes
                </Button>
              )}
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-semibold">Regenerate Section</p>
              <p className="text-xs text-muted-foreground">
                Pilih teks di editor lalu klik regenerate. Tambahkan instruksi tambahan jika perlu.
              </p>
              <Input
                value={regenerateInstruction}
                onChange={(event) => setRegenerateInstruction(event.target.value)}
                placeholder="Contoh: ringkas, lebih friendly, tambahkan contoh"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!selection || isAssistantBusy}
                onClick={handleRegenerateSection}
              >
                Regenerate Selected
              </Button>
              <div className="min-h-[96px] text-sm text-muted-foreground whitespace-pre-wrap">
                {sectionDraft || "Hasil regenerasi akan muncul di sini."}
              </div>
              <Button type="button" size="sm" variant="secondary" disabled={!sectionDraft} onClick={applySectionDraft}>
                Apply to Draft
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

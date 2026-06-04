"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { onResearchEvent } from "./research-events"

export type ResearchMode =
  | "research-assistant"
  | "token-explainer"
  | "contract-explainer"
  | "wallet-analyzer"
  | "protocol-summarizer"
  | "whitepaper-summarizer"
  | "glossary-generator"
  | "trend-analyzer"
  | "news-summarizer"

const MODE_LABELS: Record<ResearchMode, string> = {
  "research-assistant": "Research Assistant",
  "token-explainer": "Token Explainer",
  "contract-explainer": "Contract Explainer",
  "wallet-analyzer": "Wallet Analyzer",
  "protocol-summarizer": "Protocol Summary",
  "whitepaper-summarizer": "Whitepaper Summary",
  "glossary-generator": "Crypto Glossary",
  "trend-analyzer": "Trend Analyzer",
  "news-summarizer": "News Summarizer",
}

const MODE_ICONS: Record<ResearchMode, string> = {
  "research-assistant": "🔬",
  "token-explainer": "🪙",
  "contract-explainer": "📜",
  "wallet-analyzer": "👛",
  "protocol-summarizer": "⚙️",
  "whitepaper-summarizer": "📄",
  "glossary-generator": "📖",
  "trend-analyzer": "📈",
  "news-summarizer": "📰",
}

const ALL_MODES = Object.keys(MODE_LABELS) as ResearchMode[]

export function ResearchSidebar({ activeTool, onToolChange }: {
  activeTool: ResearchMode
  onToolChange: (tool: ResearchMode) => void
}) {
  // Derive mode from activeTool prop
  const mode = useMemo(() => activeTool, [activeTool])
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Ref to latest onToolChange (avoids stale closure in event listener)
  const onToolChangeRef = useRef(onToolChange)
   
  useEffect(() => { onToolChangeRef.current = onToolChange }, [onToolChange])

  // Ref to track current field values (avoids stale closures in event listener + run)
  const fieldsRef = useRef({
    topic: "", depth: "standard", token: "", contractCode: "", contractName: "",
    walletAddress: "", chain: "Ethereum", protocol: "", whitepaperTitle: "",
    whitepaperText: "", glossaryTopic: "", glossarySector: "", glossaryCount: 15,
    trendSector: "", timeframe: "medium", newsHeadline: "", newsText: "", language: "Indonesian",
  })

  // State for all fields
  const [topic, setTopic] = useState("")
  const [depth, setDepth] = useState("standard")
  const [token, setToken] = useState("")
  const [contractCode, setContractCode] = useState("")
  const [contractName, setContractName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [chain, setChain] = useState("Ethereum")
  const [protocol, setProtocol] = useState("")
  const [whitepaperTitle, setWhitepaperTitle] = useState("")
  const [whitepaperText, setWhitepaperText] = useState("")
  const [glossaryTopic, setGlossaryTopic] = useState("")
  const [glossarySector, setGlossarySector] = useState("")
  const [glossaryCount, setGlossaryCount] = useState(15)
  const [trendSector, setTrendSector] = useState("")
  const [timeframe, setTimeframe] = useState("medium")
  const [newsHeadline, setNewsHeadline] = useState("")
  const [newsText, setNewsText] = useState("")
  const [language, setLanguage] = useState("Indonesian")

  // Keep fieldsRef in sync with state (one-way: state → ref)
   
  useEffect(() => { fieldsRef.current.topic = topic }, [topic])
   
  useEffect(() => { fieldsRef.current.depth = depth }, [depth])
   
  useEffect(() => { fieldsRef.current.token = token }, [token])
   
  useEffect(() => { fieldsRef.current.contractCode = contractCode }, [contractCode])
   
  useEffect(() => { fieldsRef.current.contractName = contractName }, [contractName])
   
  useEffect(() => { fieldsRef.current.walletAddress = walletAddress }, [walletAddress])
   
  useEffect(() => { fieldsRef.current.chain = chain }, [chain])
   
  useEffect(() => { fieldsRef.current.protocol = protocol }, [protocol])
   
  useEffect(() => { fieldsRef.current.whitepaperTitle = whitepaperTitle }, [whitepaperTitle])
   
  useEffect(() => { fieldsRef.current.whitepaperText = whitepaperText }, [whitepaperText])
   
  useEffect(() => { fieldsRef.current.glossaryTopic = glossaryTopic }, [glossaryTopic])
   
  useEffect(() => { fieldsRef.current.glossarySector = glossarySector }, [glossarySector])
   
  useEffect(() => { fieldsRef.current.glossaryCount = glossaryCount }, [glossaryCount])
   
  useEffect(() => { fieldsRef.current.trendSector = trendSector }, [trendSector])
   
  useEffect(() => { fieldsRef.current.timeframe = timeframe }, [timeframe])
   
  useEffect(() => { fieldsRef.current.newsHeadline = newsHeadline }, [newsHeadline])
   
  useEffect(() => { fieldsRef.current.newsText = newsText }, [newsText])
   
  useEffect(() => { fieldsRef.current.language = language }, [language])

  // Result container key — forces remount + clears answer/error on mode change
  const answerKey = `result-${activeTool}`

  // Listen for research-input events (from clicking "Use" on a tool card)
  useEffect(() => {
    const handler = (eventMode: string, value: string) => {
      const m = eventMode as ResearchMode
      // Update field directly
      switch (m) {
        case "research-assistant":
          setTopic(value)
          fieldsRef.current.topic = value
          break
        case "token-explainer":
          setToken(value)
          fieldsRef.current.token = value
          break
        case "contract-explainer":
          setContractCode(value)
          fieldsRef.current.contractCode = value
          break
        case "wallet-analyzer":
          setWalletAddress(value)
          fieldsRef.current.walletAddress = value
          break
        case "protocol-summarizer":
          setProtocol(value)
          fieldsRef.current.protocol = value
          break
        case "whitepaper-summarizer":
          setWhitepaperTitle(value)
          fieldsRef.current.whitepaperTitle = value
          break
        case "glossary-generator":
          setGlossaryTopic(value)
          fieldsRef.current.glossaryTopic = value
          break
        case "trend-analyzer":
          setTrendSector(value)
          fieldsRef.current.trendSector = value
          break
        case "news-summarizer":
          setNewsHeadline(value)
          fieldsRef.current.newsHeadline = value
          break
      }
      // Switch to this mode
      onToolChangeRef.current(m)
    }
    const cleanup = onResearchEvent(handler)
    return cleanup
  }, [])

  function buildBody(): Record<string, unknown> {
    const base = { mode, language }
    switch (mode) {
      case "research-assistant":
        return { ...base, topic, depth }
      case "token-explainer":
        return { ...base, token }
      case "contract-explainer":
        return { ...base, contractCode, contractName }
      case "wallet-analyzer":
        return { ...base, walletAddress, chain }
      case "protocol-summarizer":
        return { ...base, protocol }
      case "whitepaper-summarizer":
        return { ...base, whitepaperTitle, whitepaperText }
      case "glossary-generator":
        return { ...base, glossaryTopic, glossarySector, glossaryCount }
      case "trend-analyzer":
        return { ...base, trendSector, timeframe }
      case "news-summarizer":
        return { ...base, newsHeadline, newsText }
    }
  }

  function getRequiredField(): string {
    switch (mode) {
      case "research-assistant":
        return topic.trim() ? "" : "Masukkan topik riset"
      case "token-explainer":
        return token.trim() ? "" : "Masukkan nama token"
      case "contract-explainer":
        return contractCode.trim() ? "" : "Masukkan kode kontrak"
      case "wallet-analyzer":
        return walletAddress.trim() ? "" : "Masukkan wallet address"
      case "protocol-summarizer":
        return protocol.trim() ? "" : "Masukkan nama protocol"
      case "whitepaper-summarizer":
        return whitepaperTitle.trim() ? "" : "Masukkan judul whitepaper"
      case "glossary-generator":
        return glossaryTopic.trim() ? "" : "Masukkan topik glossary"
      case "trend-analyzer":
        return trendSector.trim() ? "" : "Masukkan sektor/tren"
      case "news-summarizer":
        return newsHeadline.trim() ? "" : "Masukkan judul berita"
    }
  }

  async function run() {
    const requiredError = getRequiredField()
    if (requiredError) {
      setError(requiredError)
      return
    }

    setLoading(true)
    setError("")
    setAnswer("")

    try {
      const response = await fetch("/api/research/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildBody()),
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
        const chunk = decoder.decode(value, { stream: true })
        setAnswer((prev) => prev + chunk)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  function handleModeChange(m: ResearchMode) {
    onToolChange(m)
    setAnswer("")
    setError("")
  }

  function clearAll() {
    setTopic("")
    setToken("")
    setContractCode("")
    setContractName("")
    setWalletAddress("")
    setProtocol("")
    setWhitepaperTitle("")
    setWhitepaperText("")
    setGlossaryTopic("")
    setGlossarySector("")
    setTrendSector("")
    setNewsHeadline("")
    setNewsText("")
    setAnswer("")
    setError("")
    // Reset ref fields
    const f = fieldsRef.current
    f.topic = ""
    f.token = ""
    f.contractCode = ""
    f.contractName = ""
    f.walletAddress = ""
    f.protocol = ""
    f.whitepaperTitle = ""
    f.whitepaperText = ""
    f.glossaryTopic = ""
    f.glossarySector = ""
    f.trendSector = ""
    f.newsHeadline = ""
    f.newsText = ""
  }

  return (
    <aside className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">AI Research Panel</h2>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>

      {/* Mode tabs (scrollable) */}
      <div className="flex flex-wrap gap-1 mb-4">
        {ALL_MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
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

      {/* Mode-specific inputs */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {/* Language selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Bahasa:</span>
          {["Indonesian", "English"].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`rounded-md border px-2 py-0.5 text-xs ${
                language === lang ? "border-primary bg-primary/10" : ""
              }`}
            >
              {lang === "Indonesian" ? "🇮🇩 ID" : "🇬🇧 EN"}
            </button>
          ))}
        </div>

        {/* ── Research Assistant ── */}
        {mode === "research-assistant" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium">Topik Riset</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: DeFi lending protocols, Bitcoin ETF impact, Layer 2 ecosystems..."
                className="min-h-20 w-full rounded-md border bg-background p-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Kedalaman</label>
              <div className="flex gap-1">
                {(["quick", "standard", "deep"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      depth === d ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    {d === "quick" ? "⚡ Quick" : d === "standard" ? "📊 Standard" : "📚 Deep"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Token Explainer ── */}
        {mode === "token-explainer" && (
          <div>
            <label className="mb-1 block text-xs font-medium">Nama / Symbol Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Contoh: Ethereum, SOL, UNI, wBTC..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* ── Contract Explainer ── */}
        {mode === "contract-explainer" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium">Nama Kontrak</label>
              <input
                type="text"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="Contoh: Uniswap V3 Factory"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Kode Kontrak (Solidity)</label>
              <textarea
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                placeholder="Paste kode Solidity di sini..."
                className="min-h-32 w-full rounded-md border bg-background p-2 text-sm font-mono text-xs"
              />
            </div>
          </>
        )}

        {/* ── Wallet Analyzer ── */}
        {mode === "wallet-analyzer" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium">Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Chain</label>
              <div className="flex flex-wrap gap-1">
                {["Ethereum", "BSC", "Polygon", "Arbitrum", "Solana"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChain(c)}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      chain === c ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Protocol Summarizer ── */}
        {mode === "protocol-summarizer" && (
          <div>
            <label className="mb-1 block text-xs font-medium">Nama Protocol</label>
            <input
              type="text"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              placeholder="Contoh: Uniswap, Aave, Lido, MakerDAO..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* ── Whitepaper Summarizer ── */}
        {mode === "whitepaper-summarizer" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium">Judul Whitepaper</label>
              <input
                type="text"
                value={whitepaperTitle}
                onChange={(e) => setWhitepaperTitle(e.target.value)}
                placeholder="Contoh: Ethereum Yellow Paper, Solana Validator..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Isi Whitepaper / Artikel</label>
              <textarea
                value={whitepaperText}
                onChange={(e) => setWhitepaperText(e.target.value)}
                placeholder="Paste teks whitepaper atau artikel di sini (maks 10.000 karakter)..."
                className="min-h-40 w-full rounded-md border bg-background p-2 text-sm"
              />
            </div>
          </>
        )}

        {/* ── Glossary Generator ── */}
        {mode === "glossary-generator" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium">Topik</label>
              <input
                type="text"
                value={glossaryTopic}
                onChange={(e) => setGlossaryTopic(e.target.value)}
                placeholder="Contoh: DeFi, NFT, Layer 2, Smart Contracts..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Sektor (opsional)</label>
              <input
                type="text"
                value={glossarySector}
                onChange={(e) => setGlossarySector(e.target.value)}
                placeholder="Contoh: Lending, DEX, Gaming..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Jumlah Istilah</label>
              <div className="flex gap-1">
                {[10, 15, 20, 30].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setGlossaryCount(n)}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      glossaryCount === n ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Trend Analyzer ── */}
        {mode === "trend-analyzer" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium">Sektor / Nicha</label>
              <input
                type="text"
                value={trendSector}
                onChange={(e) => setTrendSector(e.target.value)}
                placeholder="Contoh: meme coins, restaking, RWA, DePIN..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Timeframe</label>
              <div className="flex gap-1">
                {([
                  { value: "short", label: "⚡ Short" },
                  { value: "medium", label: "📊 Medium" },
                  { value: "long", label: "📚 Long" },
                ]).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTimeframe(t.value)}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      timeframe === t.value ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── News Summarizer ── */}
        {mode === "news-summarizer" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium">Judul Berita</label>
              <input
                type="text"
                value={newsHeadline}
                onChange={(e) => setNewsHeadline(e.target.value)}
                placeholder="Contoh: BlackRock Bitcoin ETF receives SEC approval..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Isi Berita (opsional)</label>
              <textarea
                value={newsText}
                onChange={(e) => setNewsText(e.target.value)}
                placeholder="Paste isi berita di sini, atau biarkan kosong untuk analisa dari judul saja..."
                className="min-h-28 w-full rounded-md border bg-background p-2 text-sm"
              />
            </div>
          </>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading
            ? "⏳ Menganalisis..."
            : `🔮 ${MODE_LABELS[mode]}`}
        </button>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {/* Save to Glossary button — only show after glossary generation completes */}
        {mode === "glossary-generator" && !loading && answer && (
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch("/api/research/glossary", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    topic: glossaryTopic,
                    sector: glossarySector,
                    count: glossaryCount,
                    language,
                  }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan")
                setAnswer((prev) => prev + `\n\n✅ ${data.saved} istilah disimpan ke glossary.`)
              } catch (err) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan")
              }
            }}
            className="inline-flex h-9 w-full items-center justify-center rounded-md border border-green-600 px-4 text-sm font-medium text-green-700 hover:bg-green-50"
          >
            💾 Simpan ke Glossary
          </button>
        )}

        {/* Streaming answer — key forces remount on mode change (clears old answer) */}
        {answer ? (
          <div
            key={answerKey}
            className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto"
          >
            {answer}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
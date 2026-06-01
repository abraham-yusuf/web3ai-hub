"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ResearchMode =
  | "research-assistant"
  | "token-explainer"
  | "contract-explainer"
  | "wallet-analyzer"
  | "protocol-summarizer"
  | "whitepaper-summarizer"
  | "glossary-generator"
  | "trend-analyzer"
  | "news-summarizer"

const TOOLS: Array<{ mode: ResearchMode; icon: string; title: string }> = [
  { mode: "research-assistant", icon: "🔬", title: "Research Assistant" },
  { mode: "token-explainer", icon: "🪙", title: "Token Explainer" },
  { mode: "contract-explainer", icon: "📜", title: "Contract Explainer" },
  { mode: "wallet-analyzer", icon: "👛", title: "Wallet Analyzer" },
  { mode: "protocol-summarizer", icon: "⚙️", title: "Protocol Summary" },
  { mode: "whitepaper-summarizer", icon: "📄", title: "Whitepaper Summary" },
  { mode: "glossary-generator", icon: "📖", title: "Crypto Glossary" },
  { mode: "trend-analyzer", icon: "📈", title: "Trend Analyzer" },
  { mode: "news-summarizer", icon: "📰", title: "News Summarizer" },
]

const LANGUAGES = [
  { value: "Indonesian", label: "🇮🇩 Indonesia" },
  { value: "English", label: "🇬🇧 English" },
]

export default function AdminResearchPage() {
  const [activeTab, setActiveTab] = useState<ResearchMode>("research-assistant")
  const [language, setLanguage] = useState("Indonesian")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fields
  const [topic, setTopic] = useState("")
  const [depth, setDepth] = useState("standard")
  const [token, setToken] = useState("")
  const [contractName, setContractName] = useState("")
  const [contractCode, setContractCode] = useState("")
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

  function buildBody(): Record<string, unknown> {
    const base = { mode: activeTab, language }
    switch (activeTab) {
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

  async function run() {
    setLoading(true)
    setError("")
    setResult("")

    try {
      const response = await fetch("/api/research/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildBody()),
      })

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Request failed")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setResult((prev) => prev + chunk)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result).catch(() => {})
  }

  const activeTitle = TOOLS.find((t) => t.mode === activeTab)?.title ?? ""

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Research Tools</h1>
        <p className="text-muted-foreground text-sm">
          Generate content dengan 9 AI research tools. Hasil bisa di-copy untuk digunakan di konten.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.mode}
            type="button"
            onClick={() => {
              setActiveTab(tool.mode)
              setResult("")
              setError("")
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tool.mode
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {tool.icon} {tool.title}
          </button>
        ))}
      </div>

      {/* Language */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Bahasa:</span>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            type="button"
            onClick={() => setLanguage(lang.value)}
            className={`rounded-md border px-3 py-1 text-xs ${
              language === lang.value ? "border-primary bg-primary/10" : ""
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Mode-specific inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            {TOOLS.find((t) => t.mode === activeTab)?.icon}{" "}
            {activeTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === "research-assistant" && (
            <>
              <div>
                <Label className="text-xs">Topik Riset</Label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: DeFi lending protocols comparison"
                  className="mt-1 min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Kedalaman</Label>
                <div className="mt-1 flex gap-2">
                  {(["quick", "standard", "deep"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDepth(d)}
                      className={`rounded-md border px-3 py-1.5 text-xs ${
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

          {activeTab === "token-explainer" && (
            <div>
              <Label className="text-xs">Nama / Symbol Token</Label>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Contoh: Ethereum, SOL, UNI, wBTC..."
                className="mt-1"
              />
            </div>
          )}

          {activeTab === "contract-explainer" && (
            <>
              <div>
                <Label className="text-xs">Nama Kontrak</Label>
                <Input
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="Contoh: Uniswap V3 Factory"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Kode Kontrak (Solidity)</Label>
                <textarea
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                  placeholder="Paste kode Solidity di sini..."
                  className="mt-1 min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </>
          )}

          {activeTab === "wallet-analyzer" && (
            <>
              <div>
                <Label className="text-xs">Wallet Address</Label>
                <Input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Chain</Label>
                <div className="mt-1 flex flex-wrap gap-1">
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

          {activeTab === "protocol-summarizer" && (
            <div>
              <Label className="text-xs">Nama Protocol</Label>
              <Input
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                placeholder="Contoh: Uniswap, Aave, Lido, MakerDAO..."
                className="mt-1"
              />
            </div>
          )}

          {activeTab === "whitepaper-summarizer" && (
            <>
              <div>
                <Label className="text-xs">Judul Whitepaper</Label>
                <Input
                  value={whitepaperTitle}
                  onChange={(e) => setWhitepaperTitle(e.target.value)}
                  placeholder="Contoh: Ethereum Yellow Paper"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Isi Whitepaper / Artikel</Label>
                <textarea
                  value={whitepaperText}
                  onChange={(e) => setWhitepaperText(e.target.value)}
                  placeholder="Paste teks whitepaper atau artikel di sini..."
                  className="mt-1 min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          {activeTab === "glossary-generator" && (
            <>
              <div>
                <Label className="text-xs">Topik</Label>
                <Input
                  value={glossaryTopic}
                  onChange={(e) => setGlossaryTopic(e.target.value)}
                  placeholder="Contoh: DeFi, NFT, Layer 2..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Sektor (opsional)</Label>
                <Input
                  value={glossarySector}
                  onChange={(e) => setGlossarySector(e.target.value)}
                  placeholder="Contoh: Lending, DEX, Gaming..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Jumlah Istilah</Label>
                <div className="mt-1 flex gap-1">
                  {[10, 15, 20, 30].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGlossaryCount(n)}
                      className={`rounded-md border px-3 py-1.5 text-xs ${
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

          {activeTab === "trend-analyzer" && (
            <>
              <div>
                <Label className="text-xs">Sektor / Nicha</Label>
                <Input
                  value={trendSector}
                  onChange={(e) => setTrendSector(e.target.value)}
                  placeholder="Contoh: meme coins, restaking, RWA, DePIN..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Timeframe</Label>
                <div className="mt-1 flex gap-1">
                  {[
                    { value: "short", label: "⚡ Short" },
                    { value: "medium", label: "📊 Medium" },
                    { value: "long", label: "📚 Long" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTimeframe(t.value)}
                      className={`rounded-md border px-3 py-1.5 text-xs ${
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

          {activeTab === "news-summarizer" && (
            <>
              <div>
                <Label className="text-xs">Judul Berita</Label>
                <Input
                  value={newsHeadline}
                  onChange={(e) => setNewsHeadline(e.target.value)}
                  placeholder="Contoh: BlackRock Bitcoin ETF receives SEC approval..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Isi Berita (opsional)</Label>
                <textarea
                  value={newsText}
                  onChange={(e) => setNewsText(e.target.value)}
                  placeholder="Paste isi berita di sini..."
                  className="mt-1 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "⏳ Menganalisis..." : `🔮 Generate ${activeTitle}`}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Result */}
      {(result || loading) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Hasil — {activeTitle}</CardTitle>
            <Button variant="outline" size="sm" onClick={copyResult} disabled={!result}>
              📋 Copy
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-md bg-muted/30 p-4 text-sm whitespace-pre-wrap">
              {result || "Loading..."}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
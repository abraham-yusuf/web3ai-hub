"use client"

import { useState } from "react"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { MobileNavProvider } from "@/components/layout/mobile-nav-context"
import dynamic from "next/dynamic"
import type { ResearchMode } from "@/components/research/research-sidebar"

const ResearchSidebar = dynamic(
  () => import("@/components/research/research-sidebar").then((m) => ({ default: m.ResearchSidebar })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 rounded-lg bg-muted/50" /> },
)
import { emitResearchEvent } from "@/components/research/research-events"

type ToolMeta = {
  mode: ResearchMode
  icon: string
  title: string
  description: string
  example: string
  placeholder: string
  color: string
}

const TOOLS: ToolMeta[] = [
  {
    mode: "research-assistant",
    icon: "🔬",
    title: "Research Assistant",
    description: "Tanyakan topik crypto/Web3 apa saja, AI menghasilkan laporan riset terstruktur.",
    example: "DeFi lending protocols comparison",
    placeholder: "Contoh: Impact of Bitcoin halving 2024 on altcoins",
    color: "from-violet-500 to-purple-600",
  },
  {
    mode: "token-explainer",
    icon: "🪙",
    title: "Token Explainer",
    description: "Jelaskan apa itu token tertentu — kontrak, use cases, tokenomics, dan risiko.",
    example: "Ethereum, SOL, or any token",
    placeholder: "Contoh: Uniswap (UNI)",
    color: "from-blue-500 to-cyan-600",
  },
  {
    mode: "contract-explainer",
    icon: "📜",
    title: "Contract Explainer",
    description: "Analisis smart contract Solidity — fungsi, events, risks, dan arsitektur.",
    example: "Paste any Solidity contract",
    placeholder: "Paste smart contract code di sini...",
    color: "from-emerald-500 to-teal-600",
  },
  {
    mode: "wallet-analyzer",
    icon: "👛",
    title: "Wallet Analyzer",
    description: "Analisis wallet address — holdings, DeFi positions, dan pola aktivitas on-chain.",
    example: "0x... any Ethereum address",
    placeholder: "Contoh: 0x28C6c06298d514Db089934071355E5743bf21d60",
    color: "from-orange-500 to-amber-600",
  },
  {
    mode: "protocol-summarizer",
    icon: "⚙️",
    title: "Protocol Summary",
    description: "Rangkum cara kerja protocol DeFi — mechanism, TVL, tokens, dan risk profile.",
    example: "Aave, Lido, Curve, or MakerDAO",
    placeholder: "Contoh: Uniswap V3",
    color: "from-pink-500 to-rose-600",
  },
  {
    mode: "whitepaper-summarizer",
    icon: "📄",
    title: "Whitepaper Summary",
    description: "Rangkum whitepaper crypto — abstrak, inovasi, tokenomics, dan roadmap.",
    example: "Paste whitepaper text or article",
    placeholder: "Paste whitepaper atau artikel panjang di sini...",
    color: "from-indigo-500 to-blue-600",
  },
  {
    mode: "glossary-generator",
    icon: "📖",
    title: "Crypto Glossary",
    description: "Generate glossary istilah crypto — dari konsep dasar sampai advanced terminology.",
    example: "DeFi, NFT, Layer 2, or Smart Contracts",
    placeholder: "Contoh: DeFi basics",
    color: "from-green-500 to-emerald-600",
  },
  {
    mode: "trend-analyzer",
    icon: "📈",
    title: "Trend Analyzer",
    description: "Analisis trend dan narrative di sektor crypto — peluang, risiko, dan indikator.",
    example: "meme coins, restaking, RWA, DePIN",
    placeholder: "Contoh: Layer 2 ecosystems",
    color: "from-red-500 to-orange-600",
  },
  {
    mode: "news-summarizer",
    icon: "📰",
    title: "News Summarizer",
    description: "Rangkum berita crypto — sentiment pasar, dampak potensial, dan konteks.",
    example: "Any crypto news headline or article",
    placeholder: "Contoh: BlackRock Bitcoin ETF SEC approval",
    color: "from-yellow-500 to-amber-600",
  },
]

export default function ResearchPage() {
  const [activeTool, setActiveTool] = useState<ResearchMode>("research-assistant")

  function handleToolClick(mode: ResearchMode, value: string) {
    setActiveTool(mode)
    emitResearchEvent(mode, value)
  }

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen gap-0">
        {/* Left: Tool cards */}
        <main className="flex-1 px-4 py-8 pb-24 md:px-8 md:pb-8">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">AI Research Center</h1>
              <p className="mt-2 text-muted-foreground">
                9 AI tools untuk riset crypto & Web3. Pilih tool, masukkan input, dan dapatkan analisis instan.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  🔬 Riset Terstruktur
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  📊 Data On-Chain
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  ⚠️ Disclaimer Riset Saja
                </span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300">
              ⚠️ <strong>Disclaimer:</strong> Semua output AI bersifat edukatif dan bukan nasihat investasi.
              Selalu do your own research (DYOR) sebelum membuat keputusan finansial.
            </div>

            {/* Tool grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool) => (
                <ToolCard
                  key={tool.mode}
                  tool={tool}
                  isActive={activeTool === tool.mode}
                  onUse={(value) => handleToolClick(tool.mode, value)}
                />
              ))}
            </div>
          </div>
        </main>

        {/* Right: Research sidebar */}
        <aside className="hidden w-96 border-l bg-card p-6 lg:block sticky top-0 h-screen overflow-y-auto">
          <ResearchSidebar activeTool={activeTool} onToolChange={setActiveTool} />
        </aside>
      </div>
      <MobileBottomNav />
    </MobileNavProvider>
  )
}

function ToolCard({
  tool,
  isActive,
  onUse,
}: {
  tool: ToolMeta
  isActive: boolean
  onUse: (value: string) => void
}) {
  const [input, setInput] = useState("")

  return (
    <div
      className={`group relative flex flex-col rounded-xl border p-4 transition-all ${
        isActive ? "border-primary ring-1 ring-primary/30 bg-primary/5" : "hover:border-primary/50"
      }`}
    >
      {/* Gradient accent */}
      <div className={`absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{tool.icon}</span>
        <h3 className="font-semibold text-sm">{tool.title}</h3>
        {isActive && (
          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            Active
          </span>
        )}
      </div>

      <p className="mb-3 flex-1 text-xs text-muted-foreground leading-relaxed">
        {tool.description}
      </p>

      <div className="space-y-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              onUse(input.trim())
            }
          }}
          placeholder={tool.placeholder}
          className="w-full rounded-md border bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground/60"
        />
        <button
          type="button"
          onClick={() => {
            if (!input.trim() && tool.example) {
              onUse(tool.example)
              setInput(tool.example)
            } else if (input.trim()) {
              onUse(input.trim())
            }
          }}
          className={`w-full rounded-md py-1.5 text-xs font-medium transition-colors ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "border border-primary/50 text-primary hover:bg-primary/10"
          }`}
        >
          {isActive ? "✓ Menggunakan tool ini..." : `🔮 Gunakan ${tool.title.split(" ")[0]}`}
        </button>
      </div>
    </div>
  )
}
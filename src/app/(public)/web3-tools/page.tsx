import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Web3 Tools",
  description: "Free on-chain analytics tools: wallet tracker, gas tracker, NFT analyzer, DeFi analytics, and smart contract verifier.",
  alternates: { canonical: "/web3-tools" },
}

const tools = [
  {
    title: "Wallet Tracker",
    href: "/web3-tools/wallet-tracker",
    description: "Check any Ethereum wallet balance in real-time. Enter a 0x address to see ETH holdings.",
    icon: "💼",
    badge: "Free",
  },
  {
    title: "Gas Tracker",
    href: "/web3-tools/gas-tracker",
    description: "Live Ethereum gas prices with auto-refresh every 30 seconds. Color-coded Safe / Standard / Fast.",
    icon: "⛽",
    badge: "Live",
  },
  {
    title: "NFT Analyzer",
    href: "/web3-tools/nft-analyzer",
    description: "Analyze NFT collections: floor price, 24h volume, holder count, and collection stats.",
    icon: "🖼️",
    badge: "OpenSea",
  },
  {
    title: "DeFi Analytics",
    href: "/web3-tools/defi-analytics",
    description: "Top 15 DeFi protocols by Total Value Locked (TVL) with 24h change from DeFiLlama.",
    icon: "📊",
    badge: "DeFiLlama",
  },
  {
    title: "Contract Verifier",
    href: "/web3-tools/contract-verifier",
    description: "Verify smart contract source code on Ethereum, Polygon, BSC, and Arbitrum.",
    icon: "🔍",
    badge: "Etherscan",
  },
]

export default function Web3ToolsPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔧</span>
          <h1 className="text-4xl font-bold tracking-tight">Web3 Tools</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Free on-chain analytics tools — no wallet connection required. Powered by public APIs.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group">
            <Card className="h-full transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{tool.icon}</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {tool.badge}
                  </span>
                </div>
                <CardTitle className="mt-2 text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary group-hover:underline">
                  Open tool →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground border-t pt-4">
        ℹ️ All tools use publicly available, free APIs. Data is for informational purposes only and should not be
        considered financial advice.
      </p>
    </div>
  )
}

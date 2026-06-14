import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "DeFi Analytics — TVL Rankings",
  description: "Top 15 DeFi protocols by Total Value Locked (TVL) from DeFiLlama.",
  alternates: { canonical: "/web3-tools/defi-analytics" },
}

export const revalidate = 300 // 5 min ISR

type Protocol = {
  name: string
  tvl: number
  change_1d: number | null
  chains: string[]
  category: string
  logo?: string
}

function fmtTVL(tvl: number): string {
  if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(2)}B`
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`
  return `$${tvl.toLocaleString()}`
}

function ChangeCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) return <td className="px-4 py-3 text-right text-muted-foreground text-sm">-</td>
  const isPos = value >= 0
  return (
    <td className={`px-4 py-3 text-right text-sm font-medium ${isPos ? "text-green-500" : "text-red-500"}`}>
      {isPos ? "+" : ""}{value.toFixed(2)}%
    </td>
  )
}

export default async function DeFiAnalyticsPage() {
  let protocols: Protocol[] = []
  let totalTVL = 0
  let fetchError = ""

  try {
    const res = await fetch("https://api.llama.fi/protocols", {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`DeFiLlama returned ${res.status}`)
    const data: Protocol[] = await res.json()
    protocols = data
      .filter((p) => p.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 15)
    totalTVL = data.reduce((sum, p) => sum + (p.tvl || 0), 0)
  } catch (e: any) {
    fetchError = e.message || "Failed to load DeFi data."
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <span>📊</span> DeFi Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Top 15 protocols by Total Value Locked — powered by DeFiLlama.
        </p>
      </div>

      {/* Total TVL Card */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total DeFi TVL (All Protocols)</p>
          <p className="text-4xl font-bold mt-1">{totalTVL > 0 ? fmtTVL(totalTVL) : "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">Source: DeFiLlama · refreshes every 5 min</p>
        </CardContent>
      </Card>

      {fetchError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      {protocols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 15 Protocols by TVL</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Protocol</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">TVL</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">24h Change</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Chains</th>
                </tr>
              </thead>
              <tbody>
                {protocols.map((p, i) => (
                  <tr key={p.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logo} alt={p.name} className="h-6 w-6 rounded-full object-cover" />
                        )}
                        <span className="font-medium text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">{fmtTVL(p.tvl)}</td>
                    <ChangeCell value={p.change_1d} />
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.category || "-"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.chains?.slice(0, 3).join(", ")}{p.chains?.length > 3 ? ` +${p.chains.length - 3}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground border-t pt-4">
        Data from <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DeFiLlama</a>. For informational purposes only.
      </p>
    </div>
  )
}

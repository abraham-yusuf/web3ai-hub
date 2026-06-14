"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type GasData = {
  SafeGasPrice: string
  ProposeGasPrice: string
  FastGasPrice: string
  suggestBaseFee: string
  lastBlock: string
}

function GasPrice({ label, gwei, emoji }: { label: string; gwei: string; emoji: string }) {
  const g = parseFloat(gwei)
  const color = g < 20 ? "text-green-500" : g <= 50 ? "text-yellow-500" : "text-red-500"
  const bg = g < 20 ? "bg-green-500/10 border-green-500/20" : g <= 50 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20"
  return (
    <div className={cn("rounded-xl border p-5 space-y-2", bg)}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-4xl font-bold tabular-nums", color)}>{g.toFixed(1)}</p>
      <p className="text-xs text-muted-foreground">Gwei</p>
    </div>
  )
}

function CostRow({ label, slow, standard, fast }: { label: string; slow: string; standard: string; fast: string }) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4 text-sm">{label}</td>
      <td className="py-3 px-4 text-sm text-green-500 text-right">{slow}</td>
      <td className="py-3 px-4 text-sm text-yellow-500 text-right">{standard}</td>
      <td className="py-3 pl-4 text-sm text-red-500 text-right">{fast}</td>
    </tr>
  )
}

function estimateCost(gasUnits: number, gwei: string): string {
  const g = parseFloat(gwei)
  const eth = (gasUnits * g * 1e-9).toFixed(6)
  return `${eth} ETH`
}

export default function GasTrackerPage() {
  const [data, setData] = useState<GasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")
  const [countdown, setCountdown] = useState(30)

  const fetchGas = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken"
      )
      const json = await res.json()
      if (json.status === "1") {
        setData(json.result)
        setLastUpdated(new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Jakarta" }))
        setError("")
      } else {
        setError("Failed to fetch gas prices.")
      }
    } catch {
      setError("Network error fetching gas prices.")
    } finally {
      setLoading(false)
      setCountdown(30)
    }
  }, [])

  useEffect(() => {
    fetchGas()
    const interval = setInterval(fetchGas, 30000)
    return () => clearInterval(interval)
  }, [fetchGas])

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [lastUpdated])

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>⛽</span> Gas Tracker
          </h1>
          <p className="mt-2 text-muted-foreground">Live Ethereum gas prices, auto-refreshing every 30 seconds.</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {lastUpdated && <p>Updated: {lastUpdated}</p>}
          <p>Refresh in {countdown}s</p>
        </div>
      </div>

      {loading && <p className="text-muted-foreground animate-pulse">Fetching gas prices…</p>}
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <GasPrice label="Safe (Slow)" gwei={data.SafeGasPrice} emoji="🟢" />
            <GasPrice label="Standard" gwei={data.ProposeGasPrice} emoji="🟡" />
            <GasPrice label="Fast" gwei={data.FastGasPrice} emoji="🔴" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estimated Transaction Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left text-xs text-muted-foreground font-medium">Operation</th>
                    <th className="pb-2 text-right text-xs text-green-500 font-medium">Slow</th>
                    <th className="pb-2 text-right text-xs text-yellow-500 font-medium">Standard</th>
                    <th className="pb-2 text-right text-xs text-red-500 font-medium">Fast</th>
                  </tr>
                </thead>
                <tbody>
                  <CostRow
                    label="ETH Transfer (21k gas)"
                    slow={estimateCost(21000, data.SafeGasPrice)}
                    standard={estimateCost(21000, data.ProposeGasPrice)}
                    fast={estimateCost(21000, data.FastGasPrice)}
                  />
                  <CostRow
                    label="ERC-20 Transfer (65k gas)"
                    slow={estimateCost(65000, data.SafeGasPrice)}
                    standard={estimateCost(65000, data.ProposeGasPrice)}
                    fast={estimateCost(65000, data.FastGasPrice)}
                  />
                  <CostRow
                    label="Uniswap Swap (150k gas)"
                    slow={estimateCost(150000, data.SafeGasPrice)}
                    standard={estimateCost(150000, data.ProposeGasPrice)}
                    fast={estimateCost(150000, data.FastGasPrice)}
                  />
                </tbody>
              </table>
              {data.suggestBaseFee && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Base fee: {parseFloat(data.suggestBaseFee).toFixed(2)} Gwei &bull; Block #{data.lastBlock}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        ℹ️ Data sourced from Etherscan Gas Oracle. Gas prices fluctuate; always verify before submitting a transaction.
      </div>
    </div>
  )
}

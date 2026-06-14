"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type WalletData = {
  address: string
  balanceEth: string
  balanceWei: string
  updatedAt: string
}

export default function WalletTrackerPage() {
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<WalletData | null>(null)

  async function fetchBalance() {
    if (!address.match(/^0x[0-9a-fA-F]{40}$/)) {
      setError("Invalid Ethereum address. Must start with 0x followed by 40 hex characters.")
      return
    }
    setLoading(true)
    setError("")
    setData(null)
    try {
      const res = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=YourApiKeyToken`
      )
      const json = await res.json()
      if (json.status === "1") {
        const wei = BigInt(json.result)
        const eth = (Number(wei) / 1e18).toFixed(6)
        setData({
          address,
          balanceEth: eth,
          balanceWei: json.result,
          updatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
        })
      } else {
        setError(json.message || "Failed to fetch balance. Try again.")
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <span>💼</span> Wallet Tracker
        </h1>
        <p className="mt-2 text-muted-foreground">
          Check any Ethereum wallet balance in real-time. No wallet connection required.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ethereum Address</CardTitle>
          <CardDescription>Enter a wallet address starting with 0x</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="0x742d35Cc6634C0532925a3b8D4C9D9a3b3a1..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchBalance()}
              className="font-mono text-sm"
            />
            <Button onClick={fetchBalance} disabled={loading || !address}>
              {loading ? "Loading…" : "Check"}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/50 p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Address</p>
                  <p className="font-mono text-sm break-all">{data.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">ETH Balance</p>
                    <p className="text-3xl font-bold tabular-nums">{data.balanceEth}</p>
                    <p className="text-xs text-muted-foreground">ETH</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">In Wei</p>
                    <p className="font-mono text-xs break-all text-muted-foreground">{data.balanceWei}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Last updated: {data.updatedAt}</p>
              </div>

              <a
                href={`https://etherscan.io/address/${data.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View full history on Etherscan →
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        ⚠️ For informational purposes only. Connect MetaMask for full portfolio tracking and transaction history.
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Collection = {
  name: string
  description: string
  image_url: string
  stats?: {
    floor_price?: number
    total_volume?: number
    num_owners?: number
    total_supply?: number
    one_day_volume?: number
  }
  opensea_url?: string
}

export default function NFTAnalyzerPage() {
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [collection, setCollection] = useState<Collection | null>(null)

  async function fetchCollection() {
    if (!address.match(/^0x[0-9a-fA-F]{40}$/)) {
      setError("Invalid contract address. Must start with 0x.")
      return
    }
    setLoading(true)
    setError("")
    setCollection(null)
    try {
      const res = await fetch(
        `https://api.opensea.io/api/v2/collections?asset_contract_address=${address}&limit=1`,
        { headers: { Accept: "application/json" } }
      )
      if (!res.ok) throw new Error(`OpenSea API returned ${res.status}`)
      const json = await res.json()
      const col = json.collections?.[0] || json.collection
      if (!col) {
        setError("No collection found for this contract address. It may not be on OpenSea.")
      } else {
        setCollection(col)
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch NFT data. Check the address and try again.")
    } finally {
      setLoading(false)
    }
  }

  function fmt(n?: number, decimals = 2): string {
    if (n === undefined || n === null) return "-"
    return n.toLocaleString("en-US", { maximumFractionDigits: decimals })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <span>🖼️</span> NFT Analyzer
        </h1>
        <p className="mt-2 text-muted-foreground">
          Analyze any NFT collection: floor price, volume, holders, and more.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Address</CardTitle>
          <CardDescription>Enter the NFT contract address on Ethereum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCollection()}
              className="font-mono text-sm"
            />
            <Button onClick={fetchCollection} disabled={loading || !address}>
              {loading ? "Loading…" : "Analyze"}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {collection && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {collection.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={collection.image_url}
                    alt={collection.name}
                    className="h-16 w-16 rounded-xl object-cover border"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold">{collection.name}</h2>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{collection.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Floor Price", value: collection.stats?.floor_price !== undefined ? `${fmt(collection.stats.floor_price)} ETH` : "-" },
                  { label: "24h Volume", value: collection.stats?.one_day_volume !== undefined ? `${fmt(collection.stats.one_day_volume)} ETH` : "-" },
                  { label: "Total Volume", value: collection.stats?.total_volume !== undefined ? `${fmt(collection.stats.total_volume)} ETH` : "-" },
                  { label: "Holders", value: fmt(collection.stats?.num_owners, 0) },
                  { label: "Total Supply", value: fmt(collection.stats?.total_supply, 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {collection.opensea_url && (
                <a
                  href={collection.opensea_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View on OpenSea →
                </a>
              )}
            </div>
          )}

          {!collection && !error && !loading && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Enter an NFT contract address to analyze the collection.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        ℹ️ Data sourced from OpenSea API v2. Floor prices and volumes update periodically.
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface PriceData {
  usd: number
  change24h: number
  marketCap: number
  lastUpdated: string
}

interface PriceDisplayProps {
  network: string
  airdropId?: string
}

export function PriceDisplay({ network, airdropId }: PriceDisplayProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrice() {
      setLoading(true)
      setError(null)

      try {
        const params = airdropId
          ? `?airdropIds=${airdropId}`
          : `?ids=${network.toLowerCase()}`

        const res = await fetch(`/api/airdrop/price${params}`)
        if (!res.ok) throw new Error("Failed to fetch")

        const data = await res.json()
        const networkKey = network.toLowerCase()
        const price = data[networkKey] || data[networkKey.replace(" ", "-")]

        if (price) {
          setPriceData(price)
        } else {
          setError("Price not available")
        }
      } catch (err) {
        setError("Unable to load price")
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [network, airdropId])

  if (loading) {
    return (
      <div className="space-y-2 rounded-xl border p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    )
  }

  if (error || !priceData) {
    return (
      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          <span>Price data unavailable</span>
        </div>
      </div>
    )
  }

  const isPositive = priceData.change24h >= 0

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {network} Price
        </span>
        <Badge variant={isPositive ? "default" : "destructive"}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {Math.abs(priceData.change24h).toFixed(2)}%
        </Badge>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold">
          ${priceData.usd.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: priceData.usd < 1 ? 6 : 2,
          })}
        </p>
        {priceData.marketCap > 0 && (
          <p className="text-xs text-muted-foreground">
            MCap: ${(priceData.marketCap / 1e9).toFixed(2)}B
          </p>
        )}
      </div>
    </div>
  )
}
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// In-memory cache for 5 minutes
const priceCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Map network names to CoinGecko IDs
const networkToCoinGecko: Record<string, string> = {
  ethereum: "ethereum",
  solana: "solana",
  arbitrum: "arbitrum",
  optimism: "optimism",
  base: "base",
  polygon: "matic-network",
  avalanche: "avalanche-2",
  bsc: "binancecoin",
  scroll: "scroll",
  zkSync: "zksync",
  linea: "linea",
  mantle: "mantle",
  zora: "zora",
  mode: "mode-network",
  blast: "blast",
}

async function fetchCoinGeckoPrices(coinIds: string[]): Promise<Record<string, any>> {
  if (coinIds.length === 0) return {}

  const ids = coinIds.join(",")
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`

  try {
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 300 }, // Cache at fetch level for 5 min
    })

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`)
      return {}
    }

    return await response.json()
  } catch (error) {
    console.error("CoinGecko fetch error:", error)
    return {}
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const networkParam = searchParams.get("ids") // e.g., "ethereum,solana"
  const airdropIdsParam = searchParams.get("airdropIds") // e.g., "id1,id2"

  try {
    // Check cache first
    const cacheKey = networkParam || airdropIdsParam || ""
    const cached = priceCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    let coinIds: string[] = []

    if (networkParam) {
      // Direct network IDs provided
      coinIds = networkParam.split(",").map((n) => n.toLowerCase().trim())
    } else if (airdropIdsParam) {
      // Fetch airdrops and map networks to coin IDs
      const ids = airdropIdsParam.split(",")
      const airdrops = await prisma.airdrop.findMany({
        where: { id: { in: ids } },
        select: { id: true, network: true },
      })

      coinIds = airdrops.map((a) => {
        const coinId = networkToCoinGecko[a.network.toLowerCase()]
        return coinId || a.network.toLowerCase()
      })
    } else {
      return NextResponse.json({ error: "Provide 'ids' or 'airdropIds' query param" }, { status: 400 })
    }

    // Deduplicate
    coinIds = [...new Set(coinIds)]

    const prices = await fetchCoinGeckoPrices(coinIds)

    // Format response by network
    const result: Record<string, { usd: number; change24h: number; marketCap: number; lastUpdated: string }> = {}

    for (const [coinId, data] of Object.entries(prices)) {
      // Find the network that maps to this coinId
      const network = Object.entries(networkToCoinGecko).find(([, id]) => id === coinId)?.[0] || coinId

      result[network] = {
        usd: data.usd || 0,
        change24h: data.usd_24h_change || 0,
        marketCap: data.usd_market_cap || 0,
        lastUpdated: new Date().toISOString(),
      }
    }

    // Cache result
    priceCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Price API error:", error)
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 })
  }
}
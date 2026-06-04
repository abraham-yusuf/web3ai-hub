import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const querySchema = z.object({
  toolSlugs: z.array(z.string()).min(1).max(5),
  criteria: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = querySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { toolSlugs } = parsed.data

    const tools = await prisma.aITool.findMany({
      where: { slug: { in: toolSlugs } },
      orderBy: { rating: "desc" },
    })

    if (tools.length === 0) {
      return NextResponse.json({ error: "No tools found" }, { status: 404 })
    }

    // Normalize comparison data
    const comparisonData = tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline ?? "",
      category: tool.category,
      pricing: tool.pricing,
      pricingModel: extractPricingModel(tool.pricing),
      rating: tool.rating,
      reviews: 0, // Not available in schema
      features: extractFeatures(tool),
      pros: [] as string[], // Not available in schema
      cons: [] as string[], // Not available in schema
      affiliateUrl: tool.affiliateLink ? `/api/tools/out?slug=${tool.slug}` : null,
      imageUrl: tool.logo,
      featured: tool.featured,
      hasFreeTrial: hasFreeTrial(tool.pricing),
      hasApiAccess: hasApiAccess(tool.description),
      multiLanguage: hasMultiLanguage(tool.description),
      affiliateAvailable: !!tool.affiliateLink,
    }))

    return NextResponse.json({ tools: comparisonData })
  } catch (error) {
    console.error("[api/tools/compare] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function extractPricingModel(pricing: string): string {
  const lower = pricing.toLowerCase()
  if (lower.includes("free") || lower === "gratis" || lower === "Rp0") return "Free"
  if (lower.includes("freemium")) return "Freemium"
  if (lower.includes("monthly") || lower.includes("/bulan")) return "Monthly"
  if (lower.includes("yearly") || lower.includes("/tahun")) return "Yearly"
  if (lower.includes("one-time") || lower.includes("one time")) return "One-time"
  if (lower.includes("usage-based") || lower.includes("pay-as-you-go")) return "Usage-based"
  return "Contact for pricing"
}

function hasFreeTrial(pricing: string): boolean {
  const lower = pricing.toLowerCase()
  return lower.includes("free trial") || lower.includes("trial") || lower.includes("uji coba")
}

function hasApiAccess(description: string): boolean {
  const lower = description.toLowerCase()
  return lower.includes("api") || lower.includes("integration") || lower.includes("webhook")
}

function hasMultiLanguage(description: string): boolean {
  const lower = description.toLowerCase()
  return (
    lower.includes("multi-language") ||
    lower.includes("multilingual") ||
    lower.includes("multiple language") ||
    lower.includes("bahasa") ||
    lower.includes("indonesia") ||
    lower.includes("english")
  )
}

function extractFeatures(tool: { name: string; description: string; category: string }): string[] {
  const features: string[] = []
  const text = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase()

  if (text.includes("writing") || text.includes("content") || text.includes("text")) {
    features.push("Writing & Content")
  }
  if (text.includes("image") || text.includes("photo") || text.includes("picture") || text.includes("generate")) {
    features.push("Image Generation")
  }
  if (text.includes("video") || text.includes("animation")) {
    features.push("Video Generation")
  }
  if (text.includes("code") || text.includes("programming") || text.includes("developer")) {
    features.push("Coding & Development")
  }
  if (text.includes("audio") || text.includes("music") || text.includes("speech") || text.includes("voice")) {
    features.push("Audio & Music")
  }
  if (text.includes("web3") || text.includes("crypto") || text.includes("blockchain") || text.includes("nft")) {
    features.push("Web3 & Crypto")
  }
  if (text.includes("api") || text.includes("integration")) {
    features.push("API Access")
  }
  if (text.includes("chatbot") || text.includes("chat")) {
    features.push("Chat Interface")
  }

  return features.slice(0, 6)
}
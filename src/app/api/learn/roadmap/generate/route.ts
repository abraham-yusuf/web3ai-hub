import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAISettings } from "@/lib/ai/settings"
import { streamWithProviderFallback } from "@/lib/ai/providers"
import { rateLimit, getClientIdentity } from "@/lib/rate-limiter"

const requestSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]),
  topics: z.array(z.string().min(1).max(50)).min(1).max(10),
})

interface RoadmapStep {
  title: string
  description: string
  estimatedTime: string
  pageSlug: string
}

interface GeneratedRoadmap {
  title: string
  goal: string
  steps: RoadmapStep[]
}

const FALLBACK_ROADMAP: GeneratedRoadmap = {
  title: "Web3 & AI Fundamentals",
  goal: "Build a solid foundation in Web3 and AI concepts",
  steps: [
    { title: "Blockchain Basics", description: "Understand how blockchains work, consensus mechanisms, and why they matter.", estimatedTime: "3 days", pageSlug: "blockchain-intro" },
    { title: "Crypto Wallets & Keys", description: "Learn about public/private keys, wallet setup, and security best practices.", estimatedTime: "2 days", pageSlug: "crypto-wallets" },
    { title: "Smart Contracts 101", description: "Introduction to smart contracts, Solidity basics, and EVM.", estimatedTime: "5 days", pageSlug: "smart-contracts-intro" },
    { title: "DeFi Fundamentals", description: "Explore decentralized finance: DEXes, lending, liquidity pools.", estimatedTime: "4 days", pageSlug: "defi-fundamentals" },
    { title: "AI & LLM Basics", description: "How large language models work and why they are transforming the web.", estimatedTime: "3 days", pageSlug: "llm-basics" },
    { title: "Prompt Engineering", description: "Craft effective prompts to get the best results from AI models.", estimatedTime: "3 days", pageSlug: "prompt-engineering-intro" },
  ],
}

/**
 * POST /api/learn/roadmap/generate
 * Body: { level: "beginner" | "intermediate" | "advanced", topics: string[] }
 * Uses AI to generate a personalized learning roadmap.
 * Returns: { roadmap: { title, goal, steps: [{title, description, estimatedTime, pageSlug}] } }
 */
export async function POST(request: NextRequest) {
  // Rate limit: 10 generations per IP per hour
  const ip = getClientIdentity(request)
  const rl = rateLimit(ip, { windowMs: 60 * 60_000, maxRequests: 10 }, "learn-generate")
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before generating another roadmap." },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { level, topics } = parsed.data

  const prompt = `Generate a learning roadmap for a ${level} learner who wants to learn: ${topics.join(", ")}.
Return ONLY a valid JSON object (no markdown, no explanation) with this shape:
{
  "title": "string — concise roadmap name",
  "goal": "string — one sentence describing what they will achieve",
  "steps": [
    {
      "title": "string — step name",
      "description": "string — 1-2 sentence explanation",
      "estimatedTime": "string — e.g. '3 days', '1 week'",
      "pageSlug": "string — a kebab-case slug like 'blockchain-intro', 'defi-fundamentals', 'prompt-engineering-basics'"
    }
  ]
}
pageSlug should use generic slugs that map to real learn pages (e.g. "blockchain-intro", "defi-fundamentals", "smart-contracts-intro", "llm-basics", "prompt-engineering-intro", "nft-basics", "dao-governance", "layer2-scaling", "solidity-basics", "ai-agents-intro").
Limit to 8-12 steps. Order from foundational to advanced.`

  try {
    const settings = await getAISettings()
    let fullText = ""

    await streamWithProviderFallback(
      { provider: "openai", prompt, temperature: 0.3 },
      settings,
      (chunk: string) => {
        fullText += chunk
      }
    )

    // Extract JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/)
    let roadmap: GeneratedRoadmap

    if (jsonMatch) {
      try {
        roadmap = JSON.parse(jsonMatch[0])
        // Validate structure
        if (!roadmap.title || !roadmap.goal || !Array.isArray(roadmap.steps)) {
          throw new Error("Invalid roadmap structure")
        }
      } catch {
        roadmap = FALLBACK_ROADMAP
      }
    } else {
      roadmap = FALLBACK_ROADMAP
    }

    return NextResponse.json({ roadmap })
  } catch (err) {
    console.error("[learn/roadmap/generate] Error:", err)
    // Return fallback roadmap instead of error so UX stays smooth
    return NextResponse.json({ roadmap: FALLBACK_ROADMAP })
  }
}

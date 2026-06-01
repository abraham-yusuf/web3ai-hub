import { NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/lib/env"

const keywordBody = z.object({
  seed: z.string().min(2).max(200),
  type: z.enum(["blog", "tool", "airdrop", "learn"]).default("blog"),
  count: z.coerce.number().int().min(1).max(20).default(10),
})

async function generateKeywordsWithAI(seed: string, type: string, count: number) {
  const apiKey = env.OPENAI_API_KEY ?? env.ANTHROPIC_API_KEY ?? env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    // Fallback: simple keyword generation without AI
    return generateFallbackKeywords(seed, type, count)
  }

  const prompts: Record<string, string> = {
    blog: `Generate ${count} SEO keyword suggestions in Indonesian for a blog about "${seed}". Format as JSON array of objects: [{"keyword": "...", "intent": "informational|transactional|navigational", "volume": "high|medium|low"}]`,
    tool: `Generate ${count} SEO keyword suggestions for AI tools related to "${seed}". Format as JSON array: [{"keyword": "...", "intent": "...", "volume": "..."}]`,
    airdrop: `Generate ${count} SEO keywords for airdrop hunting content about "${seed}". Format as JSON array: [{"keyword": "...", "intent": "...", "volume": "..."}]`,
    learn: `Generate ${count} SEO keywords for Web3/AI learning content about "${seed}". Format as JSON array: [{"keyword": "...", "intent": "...", "volume": "..."}]`,
  }

  const prompt = prompts[type] ?? prompts.blog

  try {
    const response = await fetch(`${env.OPENAI_API_KEY ? "https://api.openai.com/v1" : "https://api.anthropic.com/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.OPENAI_API_KEY ? { Authorization: `Bearer ${env.OPENAI_API_KEY}` } : { "x-api-key": apiKey ?? "" }),
      },
      body: JSON.stringify({
        model: env.OPENAI_API_KEY ? "gpt-4o-mini" : "claude-3-haiku",
        messages: [
          {
            role: "system",
            content: "You are an SEO keyword research assistant. Return ONLY valid JSON array, no markdown.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? "[]"

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return generateFallbackKeywords(seed, type, count)
  } catch (error) {
    console.error("[keyword-suggest] AI error, using fallback:", error)
    return generateFallbackKeywords(seed, type, count)
  }
}

function generateFallbackKeywords(seed: string, _type: string, count: number) {
  const seedLower = seed.toLowerCase()

  const baseKeywords = [
    { keyword: `${seedLower} panduan`, intent: "informational", volume: "high" },
    { keyword: `${seedLower} tutorial`, intent: "informational", volume: "high" },
    { keyword: `apa itu ${seedLower}`, intent: "informational", volume: "high" },
    { keyword: `${seedLower} untuk pemula`, intent: "informational", volume: "medium" },
    { keyword: `cara menggunakan ${seedLower}`, intent: "informational", volume: "high" },
    { keyword: `${seedLower} Indonesia`, intent: "navigational", volume: "medium" },
    { keyword: `download ${seedLower}`, intent: "transactional", volume: "medium" },
    { keyword: `${seedLower} gratis`, intent: "transactional", volume: "high" },
    { keyword: `review ${seedLower}`, intent: "informational", volume: "medium" },
    { keyword: `harga ${seedLower}`, intent: "transactional", volume: "high" },
    { keyword: `alternatif ${seedLower}`, intent: "informational", volume: "medium" },
    { keyword: `vs ${seedLower}`, intent: "informational", volume: "medium" },
    { keyword: `best ${seedLower} 2026`, intent: "transactional", volume: "high" },
    { keyword: `${seedLower} crypto`, intent: "informational", volume: "medium" },
    { keyword: `staking ${seedLower}`, intent: "transactional", volume: "medium" },
  ]

  return baseKeywords.slice(0, count).map((k) => ({
    ...k,
    keyword: `${k.keyword} AI3`,
  }))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = keywordBody.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const { seed, type, count } = parsed.data
    const keywords = await generateKeywordsWithAI(seed, type, count)

    return NextResponse.json({ keywords, seed, type })
  } catch (error) {
    console.error("[keyword-suggest] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
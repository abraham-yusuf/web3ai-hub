import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { env } from "@/lib/env"
import { rateLimit, RATE_LIMIT_TIERS, rateLimitHeaders, getClientIdentity } from "@/lib/rate-limiter"
import {
  createCryptoResearchPrompt,
  createTokenExplainerPrompt,
  createSmartContractExplainerPrompt,
  createWalletAnalyzerPrompt,
  createProtocolSummarizerPrompt,
  createWhitepaperSummarizerPrompt,
  createGlossaryGeneratorPrompt,
  createTrendAnalyzerPrompt,
  createNewsSummarizerPrompt,
} from "@/lib/ai/prompts"

const inputSchema = z.object({
  mode: z.enum([
    "research-assistant",
    "token-explainer",
    "contract-explainer",
    "wallet-analyzer",
    "protocol-summarizer",
    "whitepaper-summarizer",
    "glossary-generator",
    "trend-analyzer",
    "news-summarizer",
  ]),
  topic: z.string().optional(),
  depth: z.string().optional(),
  token: z.string().optional(),
  contractCode: z.string().optional(),
  contractName: z.string().optional(),
  walletAddress: z.string().optional(),
  chain: z.string().optional(),
  protocol: z.string().optional(),
  whitepaperTitle: z.string().optional(),
  whitepaperText: z.string().optional(),
  glossaryTopic: z.string().optional(),
  glossarySector: z.string().optional(),
  glossaryCount: z.number().optional(),
  trendSector: z.string().optional(),
  timeframe: z.string().optional(),
  newsHeadline: z.string().optional(),
  newsText: z.string().optional(),
  language: z.string().default("Indonesian"),
})

export const runtime = "nodejs"

export async function POST(request: Request) {
  const identity = getClientIdentity(request)
  const limiter = rateLimit(identity, RATE_LIMIT_TIERS.normal, "research")

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: limiter.resetAt },
      { status: 429, headers: rateLimitHeaders(limiter) },
    )
  }

  const payload = await request.json().catch(() => null)
  const parsed = inputSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (!env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY belum dikonfigurasi" }, { status: 503 })
  }

  const data = parsed.data
  let prompt = ""

  switch (data.mode) {
    case "research-assistant":
      prompt = createCryptoResearchPrompt(
        data.topic ?? "",
        data.depth ?? "standard",
        data.language,
      )
      break
    case "token-explainer":
      prompt = createTokenExplainerPrompt(data.token ?? "", data.language)
      break
    case "contract-explainer":
      prompt = createSmartContractExplainerPrompt(
        data.contractCode ?? "",
        data.contractName ?? "",
        data.language,
      )
      break
    case "wallet-analyzer":
      prompt = createWalletAnalyzerPrompt(
        data.walletAddress ?? "",
        data.chain ?? "",
        data.language,
      )
      break
    case "protocol-summarizer":
      prompt = createProtocolSummarizerPrompt(data.protocol ?? "", data.language)
      break
    case "whitepaper-summarizer":
      prompt = createWhitepaperSummarizerPrompt(
        data.whitepaperTitle ?? "",
        data.whitepaperText ?? "",
        data.language,
      )
      break
    case "glossary-generator":
      prompt = createGlossaryGeneratorPrompt(
        data.glossaryTopic ?? "",
        data.glossarySector ?? "",
        data.glossaryCount ?? 15,
        data.language,
      )
      break
    case "trend-analyzer":
      prompt = createTrendAnalyzerPrompt(
        data.trendSector ?? "",
        data.timeframe ?? "medium",
        data.language,
      )
      break
    case "news-summarizer":
      prompt = createNewsSummarizerPrompt(
        data.newsHeadline ?? "",
        data.newsText ?? "",
        data.language,
      )
      break
    default:
      return NextResponse.json({ error: "Unknown mode" }, { status: 400 })
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ""
          if (text) controller.enqueue(encoder.encode(text))
        }
      } catch {
        // stream interrupted
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Mode": data.mode,
      ...rateLimitHeaders(limiter),
    },
  })
}
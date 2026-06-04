import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RedFlagAnalysis {
  noOfficialChannel: boolean
  promiseGuarantee: boolean
  suspiciousUrl: boolean
  fakeAirdrop: boolean
  requiresDeposit: boolean
  anonymousTeam: boolean
  unrealisticPromises: boolean
  copiedContent: boolean
}

function analyzeRedFlags(
  name: string,
  description: string,
  links: any,
  requirements: string[]
): { score: number; factors: RedFlagAnalysis; reasons: string[] } {
  const factors: RedFlagAnalysis = {
    noOfficialChannel: false,
    promiseGuarantee: false,
    suspiciousUrl: false,
    fakeAirdrop: false,
    requiresDeposit: false,
    anonymousTeam: false,
    unrealisticPromises: false,
    copiedContent: false,
  }
  const reasons: string[] = []

  const text = `${name} ${description} ${requirements.join(" ")}`.toLowerCase()

  // Check for suspicious patterns
  if (!links || Object.keys(links).length === 0) {
    factors.noOfficialChannel = true
    reasons.push("No official social media channels provided")
  }

  if (text.includes("guaranteed") || text.includes("assured") || text.includes("100% sure")) {
    factors.promiseGuarantee = true
    reasons.push("Promises guaranteed returns - common scam indicator")
  }

  if (text.includes("deposit") || text.includes("send") || text.includes("wallet")) {
    factors.requiresDeposit = true
    reasons.push("Requires depositing funds - potential scam")
  }

  if (text.includes("airdrop") && text.includes("free") && text.includes("claim now")) {
    factors.fakeAirdrop = true
    reasons.push("Classic fake airdrop pattern detected")
  }

  if (text.includes("urgent") && text.includes("limited time")) {
    factors.unrealisticPromises = true
    reasons.push("Uses urgency tactics - common scam pattern")
  }

  // Calculate score based on factors
  let score = 15 // Base score (low risk)
  if (factors.noOfficialChannel) score += 15
  if (factors.promiseGuarantee) score += 20
  if (factors.suspiciousUrl) score += 15
  if (factors.fakeAirdrop) score += 20
  if (factors.requiresDeposit) score += 25
  if (factors.anonymousTeam) score += 10
  if (factors.unrealisticPromises) score += 15
  if (factors.copiedContent) score += 10

  score = Math.min(100, Math.max(1, score))

  return { score, factors, reasons }
}

function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "SCAM" {
  if (score >= 70) return "SCAM"
  if (score >= 50) return "HIGH"
  if (score >= 25) return "MEDIUM"
  return "LOW"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { airdropId } = body

    if (!airdropId) {
      return NextResponse.json({ error: "airdropId is required" }, { status: 400 })
    }

    const airdrop = await prisma.airdrop.findUnique({
      where: { id: airdropId },
      include: { riskScore: true },
    })

    if (!airdrop) {
      return NextResponse.json({ error: "Airdrop not found" }, { status: 404 })
    }

    // Use AI to analyze if OpenAI key is available
    let aiAnalysis = null
    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Analyze this crypto airdrop for scam risk. Consider these factors:
- Name: ${airdrop.name}
- Network: ${airdrop.network}
- Description: ${airdrop.content.substring(0, 500)}
- Requirements: ${airdrop.requirements?.join(", ") || "None"}
- Links: ${JSON.stringify(airdrop.links || {})}

Return a JSON with:
- score: 1-100 (higher = more risky/scam probability)
- reasons: array of specific red flags found
- level: "LOW" or "MEDIUM" or "HIGH" or "SCAM"
`

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens: 500,
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
          aiAnalysis = JSON.parse(content)
        }
      } catch (aiError) {
        console.error("OpenAI analysis failed:", aiError)
        // Fall back to rule-based analysis
      }
    }

    // Fallback to rule-based analysis
    if (!aiAnalysis) {
      const links = airdrop.links as Record<string, string> | null
      const analysis = analyzeRedFlags(
        airdrop.name,
        airdrop.content,
        links,
        airdrop.requirements || []
      )

      aiAnalysis = {
        score: analysis.score,
        reasons: analysis.reasons,
        level: getRiskLevel(analysis.score),
        factors: analysis.factors,
      }
    }

    // Save to database
    const riskScoreData = {
      score: aiAnalysis.score,
      factors: aiAnalysis.factors || { reasons: aiAnalysis.reasons },
      analyzedAt: new Date(),
    }

    await prisma.airdropRiskScore.upsert({
      where: { airdropId: airdrop.id },
      update: riskScoreData,
      create: {
        id: undefined,
        ...riskScoreData,
        airdropId: airdrop.id,
      },
    })

    // Update airdrop risk level
    await prisma.airdrop.update({
      where: { id: airdrop.id },
      data: { riskLevel: aiAnalysis.level },
    })

    return NextResponse.json({
      score: aiAnalysis.score,
      level: aiAnalysis.level,
      factors: aiAnalysis.factors || { reasons: aiAnalysis.reasons },
      analyzedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Risk score analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze risk score" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const airdropId = searchParams.get("airdropId")

  if (!airdropId) {
    return NextResponse.json({ error: "airdropId query param is required" }, { status: 400 })
  }

  try {
    const riskScore = await prisma.airdropRiskScore.findUnique({
      where: { airdropId },
    })

    if (!riskScore) {
      return NextResponse.json({ error: "No risk score found for this airdrop" }, { status: 404 })
    }

    return NextResponse.json(riskScore)
  } catch (error) {
    console.error("Risk score fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch risk score" }, { status: 500 })
  }
}
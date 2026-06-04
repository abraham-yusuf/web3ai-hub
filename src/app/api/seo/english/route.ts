import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const requestSchema = z.object({
  content: z.string().min(10),
  targetKeyword: z.string().min(1),
  language: z.literal("en").default("en"),
})

/**
 * POST /api/seo/english
 * Analyze content and suggest English/global SEO improvements.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { content, targetKeyword } = parsed.data

    const suggestions: string[] = []
    const englishKeywords: string[] = []
    let competitionLevel: "low" | "medium" | "high" = "medium"

    // Analyze content length (English SEO best practices)
    const wordCount = content.split(/\s+/).length
    if (wordCount < 300) {
      suggestions.push("Content is too short. Aim for at least 1500-2500 words for better English SEO rankings.")
    } else if (wordCount >= 300 && wordCount < 800) {
      suggestions.push("Content length is moderate. Consider expanding to 1500+ words for comprehensive coverage.")
    } else if (wordCount >= 800 && wordCount < 1500) {
      suggestions.push("Good content length. For competitive keywords, consider expanding to 2000+ words.")
    }

    // Analyze keyword presence
    const lowerContent = content.toLowerCase()
    const lowerKeyword = targetKeyword.toLowerCase()

    if (!lowerContent.includes(lowerKeyword)) {
      suggestions.push(`Target keyword "${targetKeyword}" not found in content. Add it to title, first paragraph, and several headings.`)
    } else {
      const keywordCount = (lowerContent.match(new RegExp(lowerKeyword, "gi")) || []).length
      const density = (keywordCount / wordCount * 100).toFixed(2)

      if (keywordCount < 2) {
        suggestions.push(`Keyword "${targetKeyword}" appears ${keywordCount} times. Target 4-6 occurrences for optimal keyword density (0.5-2.5%).`)
      } else if (keywordCount >= 2 && keywordCount <= 6) {
        suggestions.push(`Good keyword density (${density}%). Maintain this range throughout the content.`)
      } else if (keywordCount > 6) {
        suggestions.push(`Keyword "${targetKeyword}" appears ${keywordCount} times. This may be seen as keyword stuffing. Keep to 4-6 times.`)
      }
    }

    // Check for SEO best practices
    const hasList = content.includes("\n-") || content.includes("\n•") || content.includes("<ul>")
    const hasHeading = content.includes("## ") || content.includes("<h2") || content.includes("<h3")
    const hasBold = content.includes("**") || content.includes("<strong")

    if (!hasList) {
      suggestions.push("Add bullet points or numbered lists to improve readability and feature snippet potential.")
    }

    if (!hasHeading) {
      suggestions.push("Use clear H2 and H3 headings to structure content and improve SEO readability.")
    }

    if (!hasBold) {
      suggestions.push("Use bold text for important terms to improve readability and emphasize key points.")
    }

    // Check content structure
    const paragraphs = content.split("\n\n").length
    if (paragraphs < 3) {
      suggestions.push("Break content into more paragraphs (3-5 sentences each) for better readability.")
    }

    // Generate English keyword variations
    const englishPrefixes = ["how to", "best", "top", "ultimate", "complete guide to"]
    const englishSuffixes = ["guide", "tutorial", "for beginners", "2024", "explained"]

    for (const prefix of englishPrefixes) {
      if (!lowerContent.includes(`${prefix} ${lowerKeyword}`) && !lowerContent.includes(`${prefix}${lowerKeyword}`)) {
        englishKeywords.push(`${prefix} ${targetKeyword}`)
      }
    }

    for (const suffix of englishSuffixes) {
      if (!lowerContent.includes(`${lowerKeyword} ${suffix}`)) {
        englishKeywords.push(`${targetKeyword} ${suffix}`)
      }
    }

    // Add semantic related keywords
    const semanticKeywords: Record<string, string[]> = {
      "web3": ["blockchain", "decentralized", "cryptocurrency", "defi", "web3 development"],
      "ai": ["machine learning", "artificial intelligence", "automation", "neural network", "chatgpt"],
      "crypto": ["bitcoin", "ethereum", "blockchain", "trading", "wallet"],
      "nft": ["digital art", "collectibles", "blockchain", "token", "marketplace"],
      "defi": ["yield farming", "liquidity", "staking", "decentralized exchange", "smart contract"],
    }

    // Find matching semantic keywords
    for (const [topic, keywords] of Object.entries(semanticKeywords)) {
      if (lowerContent.includes(topic)) {
        for (const kw of keywords) {
          if (!lowerContent.includes(kw) && englishKeywords.length < 10) {
            englishKeywords.push(kw)
          }
        }
      }
    }

    // Long-tail keyword suggestions
    englishKeywords.push(
      `${targetKeyword} explained`,
      `${targetKeyword} examples`,
      `${targetKeyword} vs alternatives`,
      `is ${targetKeyword} worth it`,
      `${targetKeyword} for business`
    )

    // Estimate competition level based on content metrics
    if (wordCount >= 2000 && lowerContent.includes(lowerKeyword)) {
      competitionLevel = "low"
    } else if (wordCount >= 1000 && lowerContent.includes(lowerKeyword) && hasHeading && hasList) {
      competitionLevel = "medium"
    } else {
      competitionLevel = "high"
    }

    // Content quality suggestions
    suggestions.push("Add an FAQ section to capture featured snippet opportunities and improve dwell time.")
    suggestions.push("Include internal links to related content (2-4 links per 1000 words).")
    suggestions.push("Add a conclusion summarizing key points and including a call-to-action.")

    // Meta and technical suggestions
    suggestions.push("Ensure meta title is 50-60 characters and includes the primary keyword.")
    suggestions.push("Keep meta description between 150-160 characters with a clear value proposition.")
    suggestions.push("Add alt text to any images containing relevant keywords.")

    // E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
    suggestions.push("Add author bio and credentials to build E-E-A-T signals.")
    suggestions.push("Include statistics, data, or citations from authoritative sources.")
    suggestions.push("Add publication and update dates to show content freshness.")

    // Deduplicate
    const uniqueSuggestions = [...new Set(suggestions)]
    const uniqueKeywords = [...new Set(englishKeywords)].slice(0, 10)

    return NextResponse.json({
      suggestions: uniqueSuggestions,
      englishKeywords: uniqueKeywords,
      competitionLevel,
      analysis: {
        wordCount,
        keywordDensity: ((lowerContent.match(new RegExp(lowerKeyword, "gi")) || []).length / wordCount * 100).toFixed(2) + "%",
        paragraphCount: paragraphs,
        hasStructure: hasHeading && hasList,
      },
    })
  } catch (error) {
    console.error("[SEO/English] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
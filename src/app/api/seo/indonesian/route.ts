import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const requestSchema = z.object({
  content: z.string().min(10),
  targetKeyword: z.string().min(1),
  language: z.literal("id").default("id"),
})

/**
 * POST /api/seo/indonesian
 * Analyze content and suggest Indonesian-specific SEO improvements.
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

    // Indonesian-specific SEO suggestions based on content analysis
    const suggestions: string[] = []
    const indonesianKeywords: string[] = []
    let searchIntent = "informational"

    // Analyze content length
    const wordCount = content.split(/\s+/).length
    if (wordCount < 300) {
      suggestions.push("Konten terlalu pendek. Pertimbangkan untuk menambahkan minimal 800-1500 kata untuk SEO Indonesia yang lebih baik.")
    } else if (wordCount >= 300 && wordCount < 600) {
      suggestions.push("Konten sudah baik, tapi pertimbangkan untuk memperluas menjadi 1000+ kata untuk peringkat yang lebih tinggi.")
    }

    // Analyze keyword presence
    const lowerContent = content.toLowerCase()
    const lowerKeyword = targetKeyword.toLowerCase()

    if (!lowerContent.includes(lowerKeyword)) {
      suggestions.push(`Kata kunci "${targetKeyword}" tidak ditemukan dalam konten. Tambahkan di judul, paragraf pertama, dan beberapa heading.`)
    } else {
      const keywordCount = (lowerContent.match(new RegExp(lowerKeyword, "gi")) || []).length
      if (keywordCount < 2) {
        suggestions.push(`Kata kunci "${targetKeyword}" muncul ${keywordCount} kali. Targetkan 3-5 kali untuk kepadatan kata kunci yang optimal (1-2%).`)
      } else if (keywordCount > 5) {
        suggestions.push(`Kata kunci "${targetKeyword}" muncul ${keywordCount} kali. Hindari keyword stuffing; targetkan 3-5 kali saja.`)
      }
    }

    // Check for Indonesian language markers
    const indonesianMarkers = ["adalah", "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "ini", "itu"]
    const foundMarkers = indonesianMarkers.filter(m => lowerContent.includes(m))

    if (foundMarkers.length < 5) {
      suggestions.push("Tambahkan lebih banyak frasa bahasa Indonesia alami seperti: 'yang', 'dan', 'untuk', 'dengan', 'pada' untuk meningkatkan konteks bahasa Indonesia.")
    }

    // Generate Indonesian keyword variations
    const indonesianPrefixes = ["cara", "tips", "panduan", "strategi", "analisis"]
    const indonesianSuffixes = ["terbaik", "terbaru", "populer", "gratis", "cepat"]

    for (const prefix of indonesianPrefixes) {
      if (!lowerContent.includes(`${prefix} ${lowerKeyword}`)) {
        indonesianKeywords.push(`${prefix} ${targetKeyword}`)
      }
    }

    for (const suffix of indonesianSuffixes) {
      if (!lowerContent.includes(`${lowerKeyword} ${suffix}`)) {
        indonesianKeywords.push(`${targetKeyword} ${suffix}`)
      }
    }

    // Add long-tail keyword suggestions
    indonesianKeywords.push(
      `${targetKeyword} Indonesia`,
      `apa itu ${targetKeyword}`,
      `${targetKeyword} untuk pemula`,
      `${targetKeyword} 2024`,
      `${targetKeyword} terpercaya`
    )

    // Determine search intent based on content analysis
    const informationalWords = ["apa", "bagaimana", "mengapa", "cara", "tips", "panduan", "strategi"]
    const transactionalWords = ["beli", "daftar", "langganan", "harga", "promo", "diskon"]

    const hasInformational = informationalWords.some(w => lowerContent.includes(w))
    const hasTransactional = transactionalWords.some(w => lowerContent.includes(w))

    if (hasInformational && !hasTransactional) {
      searchIntent = "informational"
    } else if (hasTransactional && !hasInformational) {
      searchIntent = "transactional"
    } else if (hasInformational && hasTransactional) {
      searchIntent = "mixed"
    }

    // Local SEO suggestions for Indonesian audience
    if (lowerContent.includes("indonesia") || lowerContent.includes("indonesian")) {
      suggestions.push("Konten sudah menargetkan pasar Indonesia. Pastikan menambahkan data lokasi spesifik jika relevan.")
    } else {
      suggestions.push("Tambahkan referensi ke Indonesia atau pasar lokal untuk meningkatkan SEO lokal (contoh: 'tersedia di Indonesia', 'populer di Indonesia').")
    }

    // Add meta tag suggestions
    suggestions.push("Pastikan meta description mengandung kata kunci dan ajakan bertindak (contoh: 'Pelajari sekarang', 'Daftar gratis').")
    suggestions.push("Gunakan heading H2 dan H3 yang mengandung variasi kata kunci Indonesia.")

    // Deduplicate suggestions
    const uniqueSuggestions = [...new Set(suggestions)]
    const uniqueKeywords = [...new Set(indonesianKeywords)].slice(0, 10)

    return NextResponse.json({
      suggestions: uniqueSuggestions,
      indonesianKeywords: uniqueKeywords,
      searchIntent,
      analysis: {
        wordCount,
        keywordDensity: ((lowerContent.match(new RegExp(lowerKeyword, "gi")) || []).length / wordCount * 100).toFixed(2) + "%",
        indonesianMarkersFound: foundMarkers.length,
      },
    })
  } catch (error) {
    console.error("[SEO/Indonesian] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
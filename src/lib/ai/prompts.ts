import type { AIWriterRequest } from "@/lib/ai/types"

const lengthGuide: Record<AIWriterRequest["length"], string> = {
  short: "500-800 kata",
  medium: "900-1400 kata",
  long: "1500-2200 kata",
}

const templateGuide: Record<AIWriterRequest["template"], string> = {
  tutorial: "Struktur langkah demi langkah dengan contoh praktis.",
  opinion: "Format opini dengan argumen pro-kontra dan kesimpulan jelas.",
  news: "Ringkas fakta, dampak, dan konteks pasar terbaru.",
  "tool-review": "Ulasan fitur, use-case, pricing, plus-minus.",
  "airdrop-guide": "Panduan klaim airdrop lengkap dengan checklist keamanan.",
}

export function createWriterPrompt(input: AIWriterRequest): string {
  return [
    "Kamu adalah editor senior AI3.",
    `Tulis artikel dalam bahasa: ${input.language}.`,
    `Tone: ${input.tone}.`,
    `Panjang target: ${lengthGuide[input.length]}.`,
    `Template: ${templateGuide[input.template]}.`,
    `Topik utama: ${input.topic}.`,
    "",
    "Ketentuan output:",
    "1) Gunakan format Markdown.",
    "2) Sertakan judul H1, ringkasan pembuka, subheading H2/H3, dan kesimpulan.",
    "3) Sertakan section 'Key Takeaways' dalam bullet list.",
    "4) Jika relevan, tambahkan disclaimer risiko untuk topik kripto.",
    "5) Hindari klaim pasti soal profit.",
  ].join("\n")
}

function buildContentContext(content: string): string {
  return [
    "Berikut adalah konten sumber dalam format Markdown.",
    "Gunakan konten ini sebagai konteks utama.",
    "----",
    content,
    "----",
  ].join("\n")
}

export function createSummaryPrompt(content: string, language?: string): string {
  return [
    "Kamu adalah editor AI3 yang merangkum konten.",
    language ? `Tulis ringkasan dalam bahasa: ${language}.` : "Gunakan bahasa yang sama dengan konten.",
    "Buat ringkasan 3-5 kalimat, fokus pada poin utama.",
    buildContentContext(content),
  ].join("\n")
}

export function createSeoOptimizerPrompt(content: string, language?: string): string {
  return [
    "Kamu adalah SEO editor AI3.",
    language ? `Gunakan bahasa: ${language}.` : "Gunakan bahasa yang sama dengan konten.",
    "Berikan saran SEO dalam format bullet list Markdown.",
    "Sertakan: 1) keyword utama, 2) keyword pendukung, 3) saran heading, 4) internal linking.",
    buildContentContext(content),
  ].join("\n")
}

export function createTitlePrompt(content: string, language?: string): string {
  return [
    "Kamu adalah editor AI3 untuk judul artikel.",
    language ? `Gunakan bahasa: ${language}.` : "Gunakan bahasa yang sama dengan konten.",
    "Berikan 5 opsi judul yang ringkas dan menarik.",
    "Jawab dengan daftar bernomor.",
    buildContentContext(content),
  ].join("\n")
}

export function createTagsPrompt(content: string, language?: string): string {
  return [
    "Kamu adalah editor AI3 untuk tag artikel.",
    language ? `Gunakan bahasa: ${language}.` : "Gunakan bahasa yang sama dengan konten.",
    "Berikan 6-10 tag yang relevan.",
    "Jawab dengan format: tag1, tag2, tag3.",
    buildContentContext(content),
  ].join("\n")
}

export function createExcerptPrompt(content: string, language?: string): string {
  return [
    "Kamu adalah editor AI3 untuk excerpt artikel.",
    language ? `Gunakan bahasa: ${language}.` : "Gunakan bahasa yang sama dengan konten.",
    "Tulis 1-2 kalimat ringkas sebagai meta description.",
    buildContentContext(content),
  ].join("\n")
}

export function createSectionRewritePrompt(
  selection: string,
  content: string,
  instruction?: string,
  language?: string,
): string {
  return [
    "Kamu adalah editor AI3 yang memperbaiki section artikel.",
    language ? `Gunakan bahasa: ${language}.` : "Gunakan bahasa yang sama dengan konten.",
    instruction ? `Instruksi tambahan: ${instruction}` : "Perbaiki agar lebih jelas, padat, dan mudah dipahami.",
    "Section yang perlu diperbaiki:",
    selection,
    "",
    "Konteks penuh artikel:",
    buildContentContext(content),
    "",
    "Keluarkan hanya section hasil perbaikan, tanpa tambahan judul.",
  ].join("\n")
}

// ─── Learn System Prompts ─────────────────────────────────────────────────────

export function createLessonGenerationPrompt(
  topic: string,
  trackTitle: string,
  level: string,
  language: string,
): string {
  return [
    "Kamu adalah instruktur AI3 yang membuat materi belajar berkualitas.",
    `Gunakan bahasa: ${language}.`,
    `Topik: ${topic}`,
    `Track: ${trackTitle}`,
    `Level: ${level}`,
    "",
    "Buat materi belajar lengkap dalam format Markdown dengan struktur:",
    "1. Judul (H1)",
    "2. Excerpt/ringkasan (1-2 kalimat)",
    "3. Pendahuluan (apa yang akan dipelajari)",
    "4. Konten utama dengan sub-heading (H2/H3)",
    "5. Ringkasan poin-poin penting (Key Takeaways)",
    "6. Terminologi/glossary istilah baru",
    "",
    "Keluarkan dalam format JSON:",
    '{ "title": "...", "excerpt": "...", "content": "..." }',
    "content harus dalam format Markdown lengkap.",
  ].join("\n")
}

export function createQuizGenerationPrompt(
  pageTitle: string,
  content: string,
  count: number,
  language: string,
): string {
  return [
    "Kamu adalah instruktur AI3 yang membuat kuis penilaian.",
    `Gunakan bahasa: ${language}.`,
    `Judul materi: ${pageTitle}`,
    "",
    "Berdasarkan materi berikut, buat kuis dengan pilihan ganda.",
    buildContentContext(content.slice(0, 4000)),
    "",
    `Buat ${count} soal pilihan ganda dengan format JSON:`,
    "[",
    '  { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct": 0, "explanation": "..." },',
    "  ...",
    "]",
    "",
    "correct adalah index 0-3 dari option yang benar.",
    "explanation adalah penjelasan singkat mengapa jawaban itu benar.",
    "Soal harus bervariasi: pemahaman, aplikasi, analisis.",
  ].join("\n")
}

export function createFlashcardGenerationPrompt(
  pageTitle: string,
  content: string,
  count: number,
  language: string,
): string {
  return [
    "Kamu adalah instruktur AI3 yang membuat flashcard belajar.",
    `Gunakan bahasa: ${language}.`,
    `Judul materi: ${pageTitle}`,
    "",
    "Berdasarkan materi berikut, buat flashcard.",
    buildContentContext(content.slice(0, 4000)),
    "",
    `Buat ${count} flashcard dalam format JSON:`,
    "[",
    '  { "front": "pertanyaan/konsep", "back": "jawaban/penjelasan" },',
    "  ...",
    "]",
    "",
    "front: pertanyaan singkat atau istilah (maksimal 20 kata)",
    "back: jawaban atau penjelasan (maksimal 50 kata)",
    "Fokus pada konsep penting, istilah teknis, dan fakta kunci.",
  ].join("\n")
}

export function createSimplifyContentPrompt(
  content: string,
  level: string,
  language: string,
): string {
  return [
    "Kamu adalah instruktur AI3 yang menyederhanakan materi belajar.",
    `Gunakan bahasa: ${language}.`,
    `Level penyederhanaan: ${level} (beginner/intermediate/advanced).`,
    "",
    "Sederhanakan materi berikut agar mudah dipahami:",
    buildContentContext(content),
    "",
    "Ketentuan:",
    "1. Gunakan bahasa sehari-hari",
    "2. Pecah konsep复杂 menjadi bagian kecil",
    "3. Berikan contoh konkret",
    "4. Hapus jargon yang tidak perlu, jelaskan jika perlu",
    "5. Output dalam Markdown",
    "6. Tambahkan emoji yang relevan untuk sub-heading",
    "7. Sertakan Analog & catatan berguna",
  ].join("\n")
}

export function createTranslateContentPrompt(
  content: string,
  targetLanguage: string,
): string {
  return [
    `Terjemahkan materi berikut ke bahasa ${targetLanguage}.`,
    "Pertahankan format Markdown, termasuk heading, list, dan formatting.",
    "Jika ada istilah teknis, tetap gunakan istilah Inggris jika lebih umum di Indonesia.",
    "",
    "Materi:",
    buildContentContext(content),
  ].join("\n")
}

export function createExplainTextPrompt(
  selection: string,
  context: string,
  language: string,
): string {
  return [
    "Kamu adalah tutor AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Jelaskan teks berikut secara jelas dan mendalam:`,
    `"${selection}"`,
    "",
    "Konteks materi:",
    context.slice(0, 3000),
    "",
    "Berikan penjelasan dalam format:",
    "1. Definisi/single-line explanation",
    "2. Penjelasan detail (2-3 kalimat)",
    "3. Contoh praktis",
    "4. Hubungan dengan materi lain (jika ada)",
  ].join("\n")
}

export function createLearningAssistantPrompt(
  pageTitle: string,
  content: string,
  question: string,
  language: string,
): string {
  return [
    "Kamu adalah AI Learning Assistant untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Materi: ${pageTitle}`,
    buildContentContext(content.slice(0, 5000)),
    "",
    `Pertanyaan: ${question}`,
    "",
    "Petunjuk:",
    "- Jawab berbasis materi yang diberikan",
    "- Jika pertanyaan di luar konteks, jawab secara umum tapi tetap membantu",
    "- Gunakan bahasa yang ramah dan mudah dipahami",
    "- Sertakan contoh jika relevan",
    "- Untuk konsep, gunakan analogi sehari-hari",
  ].join("\n")
}

// ─── Research System Prompts ────────────────────────────────────────────────

/**
 * 1. AI Crypto Research Assistant
 * Input: topic + depth → structured report
 */
export function createCryptoResearchPrompt(
  topic: string,
  depth: string, // quick / standard / deep
  language: string,
): string {
  const depthGuide: Record<string, string> = {
    quick: "Ringkas dalam 3-5 kalimat dengan poin-poin utama.",
    standard: "Buat laporan 300-500 kata dengan struktur: overview, key-points, implications.",
    deep: "Buat laporan mendalam 800-1200 kata dengan: executive-summary, background, analysis, opportunities, risks, conclusion.",
  }
  return [
    "Kamu adalah crypto research analyst untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Topik riset: ${topic}`,
    "",
    `Kedalaman: ${depth}`,
    depthGuide[depth] ?? depthGuide.standard,
    "",
    "Format output dalam Markdown.",
    "Untuk topik harga/token, tambahkan disclaimer: 'Informasi ini bukan nasihat keuangan.'",
    "Sertakan section 'Sources' dengan domain yang relevan.",
  ].join("\n")
}

/**
 * 2. AI Token Explainer
 * Input: token name/symbol → contract, use cases, tokenomics
 */
export function createTokenExplainerPrompt(
  token: string,
  language: string,
): string {
  return [
    "Kamu adalah blockchain analyst untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Jelaskan token berikut secara komprehensif: ${token}`,
    "",
    "Struktur penjelasan dalam Markdown:",
    "## Apa itu [Token]?",
    "## Kontrak & Standar (jika tersedia)",
    "## Use Cases & Ecosystem",
    "## Tokenomics (Supply, Distribution)",
    "## Tim & Partners (jika publik)",
    "## Kelebihan & Risiko",
    "## Kesimpulan",
    "",
    "Jika informasi on-chain tidak tersedia, jelaskan berdasarkan data yang diketahui publik.",
    "Tambahkan disclaimer: 'Bukan nasihat investasi.'",
  ].join("\n")
}

/**
 * 3. AI Smart Contract Explainer
 * Input: contract code → functionality, risks, functions, events
 */
export function createSmartContractExplainerPrompt(
  contractCode: string,
  contractName: string,
  language: string,
): string {
  return [
    "Kamu adalah smart contract auditor untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Jelaskan smart contract berikut. Nama kontrak: ${contractName || "Unknown"}`,
    "",
    "```solidity",
    contractCode.slice(0, 8000),
    "```",
    "",
    "Berikan analisis dalam format Markdown:",
    "## Overview",
    "## Fungsi Utama (public/external functions)",
    "## Events & Logs",
    "## Variabel State Penting",
    "## Keamanan — Potential Risks",
    "## Kelebihan Arsitektur",
    "## Catatan Audit (jika ada red flags, sebutkan)",
    "",
    "Jika ada vulnerability umum (reentrancy, overflow, dll), jelaskan di section Keamanan.",
    "Tambahkan disclaimer: 'Analisis ini bersifat edukatif, bukan audit resmi.'",
  ].join("\n")
}

/**
 * 4. AI Wallet Analyzer
 * Input: wallet address → portfolio, DeFi, activity
 */
export function createWalletAnalyzerPrompt(
  walletAddress: string,
  chain: string,
  language: string,
): string {
  return [
    "Kamu adalah DeFi analyst untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Analisis wallet address berikut di jaringan ${chain || "Ethereum/All Chains"}:`,
    `Address: ${walletAddress}`,
    "",
    "Berikan analisis dalam format Markdown:",
    "## Overview Wallet",
    "## Token Holdings & Portfolio Summary",
    "## DeFi Positions (lending, staking, LP, dll)",
    "## Recent Transactions (pola aktivitas)",
    "## Interaksi Protocol",
    "## Wallet Health Score (sekadar indikasi, bukan nasihat keuangan)",
    "## Risks & Recommendations",
    "",
    "Catat bahwa analisis ini berdasarkan data on-chain publik dan mungkin tidak lengkap.",
    "Tambahkan disclaimer: 'Bukan nasihat keuangan.'",
  ].join("\n")
}

/**
 * 5. AI Protocol Summarizer
 * Input: protocol name → how it works, TVL, tokens, risks
 */
export function createProtocolSummarizerPrompt(
  protocol: string,
  language: string,
): string {
  return [
    "Kamu adalah DeFi researcher untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Buat ringkasan komprehensif tentang protocol berikut: ${protocol}`,
    "",
    "Format dalam Markdown:",
    "## Apa itu [Protocol]?",
    "## Cara Kerja (Mechanism)",
    "## Produk/Fitur Utama",
    "## TVL & Metrik (jika tersedia)",
    "## Native Token & Utility",
    "## Partner & Ecosystem",
    "## Competitors & Positioning",
    "## Risiko & Kekhawatiran",
    "## Kesimpulan",
    "",
    "Tambahkan disclaimer: 'Bukan nasihat investasi.'",
  ].join("\n")
}

/**
 * 6. AI Whitepaper Summarizer
 * Input: whitepaper text → summary, key innovations, tokenomics, roadmap
 */
export function createWhitepaperSummarizerPrompt(
  title: string,
  whitepaperText: string,
  language: string,
): string {
  return [
    "Kamu adalah research analyst untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Rangkum whitepaper berikut: ${title || "Untitled"}`,
    "",
    "## Abstrak / Executive Summary",
    "## Problem yang Diangkat",
    "## Solusi & Inovasi Utama",
    "## Arsitektur / Teknologi",
    "## Tokenomics",
    "## Roadmap (jika ada)",
    "## Tim & Investor (jika ada)",
    "## Kelebihan & Kelemahan",
    "## Kesimpulan",
    "",
    "Whitepaper:",
    "---",
    whitepaperText.slice(0, 10000),
    "---",
    "",
    "Rangkum secara objektif. Jika ada klaim yang belum terbukti, sebutkan.",
    "Tambahkan disclaimer: 'Bukan nasihat investasi.'",
  ].join("\n")
}

/**
 * 7. AI Crypto Glossary Generator
 * Input: topic/sector → terms + definitions
 */
export function createGlossaryGeneratorPrompt(
  topic: string,
  sector: string,
  count: number,
  language: string,
): string {
  return [
    "Kamu adalah crypto educator untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Buat glossary crypto tentang: ${topic}`,
    sector ? `Sektor: ${sector}` : "",
    "",
    `Buat ${count} istilah penting dengan definisi.`,
    "",
    "Format sebagai JSON array:",
    "[",
    '  { "term": "...", "definition": "...", "example": "..." },',
    "  ...",
    "]",
    "",
    "Pilih istilah yang paling relevan dan sering muncul di topik tersebut.",
    "Definition max 60 kata. Example opsional.",
    "Urutan: dari konsep paling mendasar → advanced.",
  ].join("\n")
}

/**
 * 8. AI Trend Analyzer
 * Input: sector/niche → narratives, opportunities, risks
 */
export function createTrendAnalyzerPrompt(
  sector: string,
  timeframe: string, // short / medium / long
  language: string,
): string {
  return [
    "Kamu adalah crypto market strategist untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Analisis trend dan narrative di sektor: ${sector}`,
    `Timeframe: ${timeframe} (short=<3 bulan, medium=3-12 bulan, long=>1 tahun)`,
    "",
    "Format dalam Markdown:",
    "## Trend Overview",
    "## Narrative Utama yang Sedang Populer",
    "## Peluang (Opportunities)",
    "## Risiko (Risks)",
    "## Indikator yang Perlu Dipantau",
    "## Kesimpulan & Rekomendasi (edukatif saja)",
    "",
    "Fokus pada data faktual dan indikators yang tersedia.",
    "Tambahkan disclaimer: 'Bukan nasihat investasi.'",
  ].join("\n")
}

/**
 * 9. AI Market News Summarizer
 * Input: news text/URL → summary, sentiment, impact
 */
export function createNewsSummarizerPrompt(
  headline: string,
  newsText: string,
  language: string,
): string {
  return [
    "Kamu adalah crypto news analyst untuk platform AI3.",
    `Gunakan bahasa: ${language}.`,
    "",
    `Judul berita: ${headline}`,
    "",
    "## Ringkasan Berita (3-5 kalimat)",
    "## Sentimen Pasar (Bullish / Bearish / Neutral + alasan)",
    "## Dampak Potensial (short-term & long-term)",
    "## Token/Protocol yang Terkena Dampak",
    "## Projects yang Terdampak (jika ada)",
    "## Konteks & Latar Belakang",
    "",
    "Berita:",
    "---",
    newsText.slice(0, 5000),
    "---",
    "",
    "Berikan analisis yang seimbang dan objektif.",
    "Tambahkan disclaimer: 'Bukan nasihat keuangan.'",
  ].join("\n")
}

// ─── AI Translation, FAQ & Glossary Prompts ───────────────────────────────────

/**
 * FAQ Generator Prompt
 */
export function createFaqGeneratorPrompt(topic: string, count: number, language: string): string {
  const langLabel = language === "en" ? "English" : "Bahasa Indonesia"
  return [
    `You are an expert content creator for AI3 platform (Web3 + AI education).`,
    `Generate ${count} FAQ items about: "${topic}".`,
    `Language: ${langLabel}.`,
    "",
    "For each FAQ item, provide:",
    "1. A clear, specific question that users would actually ask",
    "2. A comprehensive, accurate answer (3-5 sentences)",
    "3. A category: Web3, AI Tools, DeFi, Airdrop, Technical, or General",
    "",
    "Format as JSON array:",
    "[",
    '  { "question": "...", "answer": "...", "category": "..." },',
    "  ...",
    "]",
    "",
    "Only output the JSON array. No explanation.",
  ].join("\n")
}

/**
 * Glossary Term Extractor Prompt
 */
export function createGlossaryTermExtractPrompt(topic: string, count: number, language: string): string {
  const langLabel = language === "en" ? "English" : "Bahasa Indonesia"
  return [
    `You are a Web3 and crypto expert educator for AI3 platform.`,
    `Generate ${count} glossary terms and definitions related to: "${topic}".`,
    `Language: ${langLabel}.`,
    "",
    "For each term provide:",
    "1. term: The technical term (properly capitalized)",
    "2. definition: Clear explanation (2-4 sentences, in context of Web3/AI)",
    "3. category: DeFi / NFT / Layer1 / Layer2 / AI / Security / General",
    "",
    "Format as JSON array:",
    "[",
    '  { "term": "...", "definition": "...", "category": "..." },',
    "  ...",
    "]",
    "",
    "Only output the JSON array. No explanation.",
  ].join("\n")
}

/**
 * AI Content Translation Prompt (for AI Translate API)
 */
export function createAiTranslateContentPrompt(
  content: string,
  targetLocale: "id" | "en",
  sourceLocale?: "id" | "en"
): string {
  const targetLang = targetLocale === "en" ? "English" : "Bahasa Indonesia"
  const sourceNote = sourceLocale ? `Translate from ${sourceLocale === "en" ? "English" : "Bahasa Indonesia"}` : "Detect the language and translate"
  return [
    `You are a professional translator for AI3 platform (Web3 + AI education).`,
    `${sourceNote} to ${targetLang}.`,
    "",
    "Preserve ALL formatting:",
    "- MDX/Markdown syntax (headings ##, lists -, code blocks ```, links, tables)",
    "- Bold **text** and italic *text*",
    "- Line breaks and paragraph structure",
    "- Technical terms, code snippets, and proper nouns",
    "",
    "Content to translate:",
    "---",
    content,
    "---",
    "",
    "Only output the translated content. No quotes, no explanations, no [translation] markers.",
  ].join("\n")
}

// ─── Blog Content Expansion Prompts ──────────────────────────────────────────

export type BlogCategory = "web3-fundamentals" | "ai-tutorials" | "airdrop-guides" | "opinion-news"

const categoryGuide: Record<BlogCategory, string> = {
  "web3-fundamentals": "Artikel edukatif tentang dasar-dasar Web3 dan blockchain. Gunakan analogi sehari-hari. Target audience: pemula yang belum punya pengalaman crypto. Sertakan langkah praktis jika relevan.",
  "ai-tutorials": "Tutorial praktis tentang AI tools dan teknik. Sertakan contoh kode atau prompt. Target audience: developer dan tech enthusiast. Tambahkan difficulty indicator (beginner/intermediate/advanced).",
  "airdrop-guides": "Panduan airdrop dengan langkah-langkah klaim. Sertakan checklist keamanan dan red flags scam. Target audience: crypto enthusiast. Link ke Airdrop Hub jika relevan.",
  "opinion-news": "Artikel opini atau berita tentang tren Web3/AI. Sertakan analisis mendalam dan perspektif lokal Indonesia. Target audience: pembaca yang sudah familiar dengan Web3/AI.",
}

export function createBlogContentPrompt(
  category: BlogCategory,
  topic: string,
  language: string,
  customPrompt?: string,
): string {
  return [
    "Kamu adalah content writer senior AI3 — platform Web3 & AI #1 di Indonesia.",
    `Bahasa: ${language === "en" ? "English" : "Bahasa Indonesia"}.`,
    `Kategori: ${category}.`,
    categoryGuide[category],
    `Topik: ${topic}.`,
    "",
    "Buat artikel blog lengkap dengan format JSON:",
    "{",
    '  "title": "Judul artikel (menarik, SEO-friendly)",',
    '  "slug": "url-friendly-slug",',
    '  "excerpt": "Ringkasan 1-2 kalimat untuk meta description",',
    '  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],',
    '  "readingTime": 8,',
    '  "seo": {',
    '    "titleTag": "Title tag untuk SEO (maks 60 karakter, | AI3)",',
    '    "metaDescription": "Meta description (maks 160 karakter)"',
    "  },",
    '  "content": "Konten artikel dalam format Markdown"',
    "}",
    "",
    "Ketentuan konten:",
    "1. Gunakan heading H1 untuk judul utama, H2/H3 untuk sub-section",
    "2. Panjang target: 1200-1800 kata",
    "3. Sertakan Key Takeaways dalam bullet list di akhir",
    "4. Untuk kripto: tambahkan disclaimer risiko",
    "5. Hindari klaim pasti soal profit",
    "6. Gunakan bahasa yang mudah dipahami",
    customPrompt ? `7. ${customPrompt}` : "",
    "",
    "Output hanya JSON, tanpa penjelasan tambahan.",
  ].filter(Boolean).join("\n")
}

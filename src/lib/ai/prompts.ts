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

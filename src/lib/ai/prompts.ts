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
    "Kamu adalah editor senior Web3AI Hub.",
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

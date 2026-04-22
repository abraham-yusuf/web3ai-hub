import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { PrismaClient, type TrackType } from "@prisma/client"

const prisma = new PrismaClient()

function toTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const TRACK_META: Record<string, { title: string; description: string; type: TrackType; order: number }> = {
  "web3-basics": {
    title: "Web3 Fundamentals",
    description: "Pelajari dasar-dasar blockchain, cryptocurrency, wallet, smart contract, DeFi, dan NFT dari nol.",
    type: "WEB3",
    order: 0,
  },
  "ai-basics": {
    title: "AI Fundamentals",
    description: "Memahami Artificial Intelligence, LLM, prompt engineering, machine learning, dan AI agents.",
    type: "AI",
    order: 1,
  },
}

const SECTION_META: Record<string, { title: string; order: number }[]> = {
  "web3-basics": [
    { title: "Pengenalan Blockchain", order: 0 },
    { title: "DeFi & Smart Contracts", order: 1 },
    { title: "NFT & Ownership", order: 2 },
  ],
  "ai-basics": [
    { title: "Pengenalan AI", order: 0 },
    { title: "LLM & Prompt Engineering", order: 1 },
    { title: "AI Tools & Agents", order: 2 },
  ],
}

const PAGE_SECTIONS: Record<string, string> = {
  "blockchain-intro": "Pengenalan Blockchain",
  "what-is-ethereum": "Pengenalan Blockchain",
  "wallet-security-101": "Pengenalan Blockchain",
  "smart-contracts-101": "DeFi & Smart Contracts",
  "defi-fundamentals": "DeFi & Smart Contracts",
  "nft-dan-digital-ownership": "NFT & Ownership",
  "ai-intro": "Pengenalan AI",
  "machine-learning-overview": "Pengenalan AI",
  "llm-api-primer": "LLM & Prompt Engineering",
  "prompt-engineering-fundamentals": "LLM & Prompt Engineering",
  "ai-tools-untuk-produktivitas": "AI Tools & Agents",
  "ai-agents-dan-autonomous-systems": "AI Tools & Agents",
}

async function seedLearnFromMdx() {
  const learnRoot = path.join(process.cwd(), "content", "learn")
  if (!fs.existsSync(learnRoot)) {
    console.log("  [learn] content/learn not found, skipping MDX migration")
    return
  }

  const tracks = fs.readdirSync(learnRoot).filter((entry) => fs.statSync(path.join(learnRoot, entry)).isDirectory())

  for (const trackSlug of tracks) {
    const meta = TRACK_META[trackSlug] ?? {
      title: toTitleFromSlug(trackSlug),
      description: `Track ${toTitleFromSlug(trackSlug)}`,
      type: "WEB3" as TrackType,
      order: 99,
    }

    console.log(`  [learn] Seeding track: ${meta.title}`)

    const track = await prisma.learnTrack.upsert({
      where: { slug: trackSlug },
      update: { title: meta.title, description: meta.description, type: meta.type, order: meta.order },
      create: { slug: trackSlug, title: meta.title, description: meta.description, type: meta.type, order: meta.order },
    })

    const sectionDefs = SECTION_META[trackSlug] ?? [{ title: "Core Lessons", order: 0 }]
    const sectionMap: Record<string, string> = {}

    for (const sectionDef of sectionDefs) {
      const sectionId = `${track.id}-${sectionDef.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
      const section = await prisma.learnSection.upsert({
        where: { id: sectionId },
        update: { title: sectionDef.title, order: sectionDef.order },
        create: { id: sectionId, title: sectionDef.title, order: sectionDef.order, trackId: track.id },
      })
      sectionMap[sectionDef.title] = section.id
    }

    const pages = fs.readdirSync(path.join(learnRoot, trackSlug)).filter((file) => file.endsWith(".mdx")).sort()

    for (const [fileOrder, file] of pages.entries()) {
      const fullPath = path.join(learnRoot, trackSlug, file)
      const source = fs.readFileSync(fullPath, "utf8")
      const parsed = matter(source)
      const pageSlug = `${trackSlug}/${file.replace(/\.mdx$/, "")}`
      const fileBase = file.replace(/\.mdx$/, "")
      const sectionTitle = PAGE_SECTIONS[fileBase] ?? sectionDefs[0]?.title ?? "Core Lessons"
      const sectionId = sectionMap[sectionTitle] ?? Object.values(sectionMap)[0]

      if (!sectionId) continue

      await prisma.learnPage.upsert({
        where: { slug: pageSlug },
        update: {
          title: String(parsed.data.title ?? toTitleFromSlug(fileBase)),
          content: parsed.content,
          order: typeof parsed.data.order === "number" ? parsed.data.order : fileOrder + 1,
          sectionId,
        },
        create: {
          title: String(parsed.data.title ?? toTitleFromSlug(fileBase)),
          slug: pageSlug,
          content: parsed.content,
          order: typeof parsed.data.order === "number" ? parsed.data.order : fileOrder + 1,
          sectionId,
        },
      })
      console.log(`    [page] ${pageSlug}`)
    }
  }
}

async function seedAITools() {
  console.log("  [tools] Seeding AI tools...")
  const tools = [
    { name: "ChatGPT", slug: "chatgpt", tagline: "Sistem AI paling populer dari OpenAI.", category: "Writing & Content", pricing: "Freemium", description: "ChatGPT adalah model bahasa besar dari OpenAI untuk percakapan, coding, dan analisis.", featured: true, rating: 4.8 },
    { name: "Claude", slug: "claude", tagline: "AI asisten cerdas dari Anthropic.", category: "Writing & Content", pricing: "Freemium", description: "Claude dari Anthropic unggul dalam analisis dokumen panjang, coding, dan penalaran.", featured: true, rating: 4.9 },
    { name: "Midjourney", slug: "midjourney", tagline: "Seni AI dari deskripsi teks.", category: "Image Generation", pricing: "Paid", description: "Midjourney menciptakan gambar dari deskripsi bahasa alami.", featured: false, rating: 4.7 },
    { name: "GitHub Copilot", slug: "github-copilot", tagline: "AI pair programmer.", category: "Coding", pricing: "Paid", description: "GitHub Copilot menyarankan kode secara real-time di editor.", featured: true, rating: 4.6 },
    { name: "Cursor", slug: "cursor", tagline: "AI-first code editor.", category: "Coding", pricing: "Freemium", description: "Cursor adalah code editor berbasis VS Code dengan AI terintegrasi.", featured: true, rating: 4.8 },
    { name: "ElevenLabs", slug: "elevenlabs", tagline: "AI voice synthesis natural.", category: "Audio", pricing: "Freemium", description: "ElevenLabs menyediakan text-to-speech dan voice cloning berkualitas.", featured: false, rating: 4.5 },
    { name: "Vercel v0", slug: "vercel-v0", tagline: "Generate UI dari teks.", category: "Coding", pricing: "Freemium", description: "v0 oleh Vercel mengubah deskripsi teks menjadi komponen React/Next.js.", featured: true, rating: 4.4 },
    { name: "Notion AI", slug: "notion-ai", tagline: "AI di workspace Notion.", category: "Productivity", pricing: "Freemium", description: "Notion AI membantu menulis, meringkas, dan mengorganisir catatan.", featured: false, rating: 4.3 },
  ]
  for (const tool of tools) {
    await prisma.aITool.upsert({ where: { slug: tool.slug }, update: { name: tool.name, tagline: tool.tagline, description: tool.description, rating: tool.rating }, create: tool })
  }
  console.log(`  [tools] Seeded ${tools.length} tools`)
}

async function seedAirdrops() {
  console.log("  [airdrop] Seeding airdrops...")
  const airdrops = [
    { name: "zkSync", slug: "zksync", network: "zkSync Era", status: "ACTIVE" as const, estimatedReward: "$500 - $5000", difficulty: "MEDIUM" as const, content: "# zkSync Airdrop Guide\n\nIkuti langkah berikut untuk berpartisipasi dalam ekosistem zkSync.\n\n## Langkah\n\n1. Bridge ETH ke zkSync Era\n2. Gunakan DEX (SyncSwap, Mute)\n3. Mint NFT\n4. Aktif beberapa bulan berturut-turut", requirements: ["Mainnet bridge", "Volume > $1000", "Unique months > 3"], links: { website: "https://zksync.io" } },
    { name: "LayerZero", slug: "layerzero", network: "Multi-Chain", status: "ACTIVE" as const, estimatedReward: "$1000+", difficulty: "HARD" as const, content: "# LayerZero Airdrop Guide\n\nLayerZero adalah protokol interoperabilitas omnichain.\n\n## Langkah\n\n1. Bridge via Stargate\n2. Gunakan liquid swap\n3. Vote di Snapshot", requirements: ["Bridge via Stargate", "Use liquid swap", "Vote on Snapshot"], links: { website: "https://layerzero.network" } },
    { name: "Scroll", slug: "scroll", network: "Scroll", status: "UPCOMING" as const, estimatedReward: "$200 - $2000", difficulty: "EASY" as const, content: "# Scroll Airdrop Guide\n\nScroll adalah zkEVM Layer 2 kompatibel Ethereum.\n\n## Langkah\n\n1. Bridge ke Scroll mainnet\n2. Swap token di DEX\n3. Provide liquidity", requirements: ["Bridge to Scroll", "Use native DEX", "Provide liquidity"], links: { website: "https://scroll.io" } },
  ]
  for (const airdrop of airdrops) {
    await prisma.airdrop.upsert({ where: { slug: airdrop.slug }, update: { name: airdrop.name, content: airdrop.content }, create: airdrop })
  }
  console.log(`  [airdrop] Seeded ${airdrops.length} airdrops`)
}

async function main() {
  console.log("=== Web3AI Hub Seed ===")
  await seedAITools()
  await seedAirdrops()
  await seedLearnFromMdx()
  console.log("\n=== Seeding completed! ===")
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

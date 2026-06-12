import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import type { PrismaClient, TrackType } from "@prisma/client"

type TrackMeta = {
  title: string
  description: string
  type: TrackType
  order: number
}

type SectionMeta = {
  title: string
  order: number
}

type MigrationSummary = {
  tracks: number
  sections: number
  pages: number
}

type FrontMatter = Record<string, unknown>

export const TRACK_META: Record<string, TrackMeta> = {
  "web3-basics": {
    title: "Web3 Fundamentals",
    description: "Pelajari dasar blockchain, Ethereum, DeFi, NFT, dan governance dalam ekosistem Web3.",
    type: "WEB3",
    order: 0,
  },
  "ai-basics": {
    title: "AI Fundamentals",
    description: "Memahami AI modern, LLM, prompt engineering, evaluasi model, AI tools, fine-tuning, RAG production, dan AI agents.",
    type: "AI",
    order: 1,
  },
}

export const SECTION_META: Record<string, SectionMeta[]> = {
  "web3-basics": [
    { title: "Pengenalan Blockchain", order: 0 },
    { title: "DeFi & Smart Contracts", order: 1 },
    { title: "NFT & Ownership", order: 2 },
    { title: "Governance & Komunitas", order: 3 },
  ],
  "ai-basics": [
    { title: "Pengenalan AI", order: 0 },
    { title: "LLM & Prompt Engineering", order: 1 },
    { title: "AI Tools & Agents", order: 2 },
    { title: "Evaluasi & Etika AI", order: 3 },
    { title: "LLM Integration", order: 4 },
    { title: "Fine-tuning", order: 5 },
    { title: "RAG Production", order: 6 },
    { title: "AI Agent Development", order: 7 },
  ],
}

export const PAGE_SECTIONS: Record<string, string> = {
  "blockchain-intro": "Pengenalan Blockchain",
  "what-is-ethereum": "Pengenalan Blockchain",
  "wallet-security-101": "Pengenalan Blockchain",
  "konsensus-dan-validasi": "Pengenalan Blockchain",
  "blockchain-explorer-dasar": "Pengenalan Blockchain",
  "smart-contracts-101": "DeFi & Smart Contracts",
  "defi-fundamentals": "DeFi & Smart Contracts",
  "gas-fees-dan-transaksi": "DeFi & Smart Contracts",
  "nft-dan-digital-ownership": "NFT & Ownership",
  "dao-dan-governance": "Governance & Komunitas",
  "ai-intro": "Pengenalan AI",
  "machine-learning-overview": "Pengenalan AI",
  "data-dan-pipeline-ml": "Pengenalan AI",
  "llm-api-primer": "LLM & Prompt Engineering",
  "prompt-engineering-fundamentals": "LLM & Prompt Engineering",
  "rag-dan-vector-search": "LLM & Prompt Engineering",
  "ai-tools-untuk-produktivitas": "AI Tools & Agents",
  "ai-agents-dan-autonomous-systems": "AI Tools & Agents",
  "evaluasi-model-ai": "Evaluasi & Etika AI",
  "ai-ethics-dan-responsible": "Evaluasi & Etika AI",
  "llm-integration-api-basics": "LLM Integration",
  "llm-integration-prompt-design": "LLM Integration",
  "llm-integration-streaming": "LLM Integration",
  "llm-integration-error-handling": "LLM Integration",
  "llm-integration-cost-optimization": "LLM Integration",
  "llm-integration-multi-provider": "LLM Integration",
  "fine-tuning-when-to-finetune": "Fine-tuning",
  "fine-tuning-data-preparation": "Fine-tuning",
  "fine-tuning-training-process": "Fine-tuning",
  "fine-tuning-evaluation": "Fine-tuning",
  "fine-tuning-deployment": "Fine-tuning",
  "rag-production-architecture": "RAG Production",
  "rag-production-embeddings": "RAG Production",
  "rag-production-vector-database": "RAG Production",
  "rag-production-retrieval-strategies": "RAG Production",
  "rag-production-deployment": "RAG Production",
  "ai-agents-architecture": "AI Agent Development",
  "ai-agents-tool-use": "AI Agent Development",
  "ai-agents-memory-systems": "AI Agent Development",
  "ai-agents-multi-agent": "AI Agent Development",
  "ai-agents-evaluation": "AI Agent Development",
  "ai-agents-safety": "AI Agent Development",
}

function toTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function createAsciiSlug(title: string) {
  return title
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function extractTitle(data: FrontMatter, fallback: string) {
  return typeof data.title === "string" && data.title.trim().length > 0 ? data.title : fallback
}

function extractOrder(data: FrontMatter, fallback: number) {
  if (typeof data.order === "number" && data.order >= 0) return data.order
  if (typeof data.order === "string") {
    const parsed = Number(data.order)
    if (Number.isFinite(parsed) && parsed >= 0) return parsed
  }
  return fallback
}

export async function migrateLearnFromMdx(prisma: PrismaClient): Promise<MigrationSummary> {
  const learnRoot = path.join(process.cwd(), "content", "learn")

  if (!fs.existsSync(learnRoot)) {
    return { tracks: 0, sections: 0, pages: 0 }
  }

  const trackEntries = fs.readdirSync(learnRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  let trackCount = 0
  let sectionCount = 0
  let pageCount = 0

  for (const entry of trackEntries) {
    const trackSlug = entry.name
    const meta = TRACK_META[trackSlug] ?? {
      title: toTitleFromSlug(trackSlug),
      description: `Track ${toTitleFromSlug(trackSlug)}`,
      type: "WEB3",
      order: 99,
    }

    const track = await prisma.learnTrack.upsert({
      where: { slug: trackSlug },
      update: { title: meta.title, description: meta.description, type: meta.type, order: meta.order },
      create: { slug: trackSlug, title: meta.title, description: meta.description, type: meta.type, order: meta.order },
    })
    trackCount += 1

    const sectionDefs = SECTION_META[trackSlug] ?? [{ title: "Core Lessons", order: 0 }]
    const sectionMap: Record<string, string> = {}

    for (const sectionDef of sectionDefs) {
      const sectionId = `${track.id}-${createAsciiSlug(sectionDef.title)}`
      const section = await prisma.learnSection.upsert({
        where: { id: sectionId },
        update: { title: sectionDef.title, order: sectionDef.order },
        create: { id: sectionId, title: sectionDef.title, order: sectionDef.order, trackId: track.id },
      })
      sectionMap[sectionDef.title] = section.id
      sectionCount += 1
    }

    const trackPath = path.join(learnRoot, trackSlug)
    const pages = fs.readdirSync(trackPath).filter((file) => file.endsWith(".mdx")).sort()

    for (const [fileOrder, file] of pages.entries()) {
      const fullPath = path.join(trackPath, file)
      const source = fs.readFileSync(fullPath, "utf8")
      const parsed = matter(source)
      const frontMatter = parsed.data as FrontMatter
      const fileBase = file.replace(/\.mdx$/, "")
      const pageSlug = `${trackSlug}/${fileBase}`
      const sectionTitle = PAGE_SECTIONS[fileBase] ?? sectionDefs[0]?.title ?? "Core Lessons"
      const sectionId = sectionMap[sectionTitle] ?? Object.values(sectionMap)[0]

      if (!sectionId) continue

      await prisma.learnPage.upsert({
        where: { slug: pageSlug },
        update: {
          title: extractTitle(frontMatter, toTitleFromSlug(fileBase)),
          content: parsed.content,
          order: extractOrder(frontMatter, fileOrder + 1),
          sectionId,
        },
        create: {
          title: extractTitle(frontMatter, toTitleFromSlug(fileBase)),
          slug: pageSlug,
          content: parsed.content,
          order: extractOrder(frontMatter, fileOrder + 1),
          sectionId,
        },
      })
      pageCount += 1
    }
  }

  return { tracks: trackCount, sections: sectionCount, pages: pageCount }
}

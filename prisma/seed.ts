import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function toTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

async function seedLearnFromMdx() {
  const learnRoot = path.join(process.cwd(), "content", "learn")
  if (!fs.existsSync(learnRoot)) return

  const tracks = fs.readdirSync(learnRoot).filter((entry) => fs.statSync(path.join(learnRoot, entry)).isDirectory())

  for (const [trackOrder, trackSlug] of tracks.entries()) {
    const track = await prisma.learnTrack.upsert({
      where: { slug: trackSlug },
      update: { title: toTitleFromSlug(trackSlug), order: trackOrder },
      create: {
        slug: trackSlug,
        title: toTitleFromSlug(trackSlug),
        order: trackOrder,
        description: `Track ${toTitleFromSlug(trackSlug)} yang dimigrasi dari MDX`,
      },
    })

    const section = await prisma.learnSection.upsert({
      where: { id: `${track.id}-core` },
      update: { title: "Core Lessons", order: 0 },
      create: {
        id: `${track.id}-core`,
        title: "Core Lessons",
        order: 0,
        trackId: track.id,
      },
    })

    const pages = fs
      .readdirSync(path.join(learnRoot, trackSlug))
      .filter((file) => file.endsWith(".mdx"))
      .sort()

    for (const [fileOrder, file] of pages.entries()) {
      const fullPath = path.join(learnRoot, trackSlug, file)
      const source = fs.readFileSync(fullPath, "utf8")
      const parsed = matter(source)
      const pageSlug = `${trackSlug}/${file.replace(/\.mdx$/, "")}`

      await prisma.learnPage.upsert({
        where: { slug: pageSlug },
        update: {
          title: String(parsed.data.title ?? file),
          content: parsed.content,
          order: typeof parsed.data.order === "number" ? parsed.data.order : fileOrder + 1,
          sectionId: section.id,
        },
        create: {
          title: String(parsed.data.title ?? file),
          slug: pageSlug,
          content: parsed.content,
          order: typeof parsed.data.order === "number" ? parsed.data.order : fileOrder + 1,
          sectionId: section.id,
        },
      })
    }
  }
}

async function main() {
  console.log("Seeding data...")

  const tools = [
    {
      name: "ChatGPT",
      slug: "chatgpt",
      tagline: "Sistem AI paling populer dari OpenAI.",
      category: "Writing & Content",
      pricing: "Freemium",
      description: "ChatGPT adalah model bahasa besar yang dilatih oleh OpenAI.",
      affiliateLink: "https://chat.openai.com",
      featured: true,
      rating: 4.8,
    },
    {
      name: "Claude",
      slug: "claude",
      tagline: "AI asisten yang cerdas dan aman dari Anthropic.",
      category: "Writing & Content",
      pricing: "Freemium",
      description: "Claude adalah generasi terbaru AI dari Anthropic.",
      affiliateLink: "https://claude.ai",
      featured: true,
      rating: 4.9,
    },
    {
      name: "Midjourney",
      slug: "midjourney",
      tagline: "Seni AI dari deskripsi teks.",
      category: "Image Generation",
      pricing: "Paid",
      description: "Midjourney adalah program kecerdasan buatan yang menciptakan gambar dari deskripsi bahasa alami.",
      affiliateLink: "https://midjourney.com",
      featured: false,
      rating: 4.7,
    },
  ]

  for (const tool of tools) {
    await prisma.aITool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: tool,
    })
  }

  const airdrops = [
    {
      name: "zkSync",
      slug: "zksync",
      network: "zkSync Era",
      status: "ACTIVE" as const,
      estimatedReward: "$500 - $5000",
      difficulty: "MEDIUM" as const,
      content: "# zkSync Airdrop Guide\n\nIkuti langkah-langkah berikut untuk berpartisipasi dalam ekosistem zkSync.",
      requirements: ["Mainnet bridge", "Volume > $1000", "Unique months > 3"],
      links: {
        website: "https://zksync.io",
        twitter: "https://twitter.com/zksync",
      },
    },
    {
      name: "LayerZero",
      slug: "layerzero",
      network: "Multi-Chain",
      status: "ACTIVE" as const,
      estimatedReward: "$1000+",
      difficulty: "HARD" as const,
      content: "# LayerZero Airdrop Guide\n\nLayerZero adalah protokol interoperabilitas omnichain.",
      requirements: ["Bridge via Stargate", "Use liquid swap", "Vote on Snapshot"],
      links: {
        website: "https://layerzero.network",
        twitter: "https://twitter.com/LayerZero_Labs",
      },
    },
  ]

  for (const airdrop of airdrops) {
    await prisma.airdrop.upsert({
      where: { slug: airdrop.slug },
      update: {},
      create: airdrop,
    })
  }

  await seedLearnFromMdx()

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

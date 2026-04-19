import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding data...")

  // Seed AI Tools
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

  // Seed Airdrops
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

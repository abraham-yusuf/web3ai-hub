import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type CollectionSeed = {
  name: string
  slug: string
  description: string
  isPublic: boolean
  isFeatured: boolean
  color: string
  toolSlugs: string[]
}

const defaultCollections: CollectionSeed[] = [
  {
    name: "Best Free AI Tools",
    slug: "best-free-ai-tools",
    description: "High-quality AI tools that offer generous free tiers. Perfect for getting started with AI without spending a dime.",
    isPublic: true,
    isFeatured: true,
    color: "#10b981",
    toolSlugs: ["chatgpt", "claude", "grammarly-go", "photomath", "quillbot"],
  },
  {
    name: "AI for Developers",
    slug: "ai-for-developers",
    description: "Essential AI tools for software developers. From code completion to debugging, these tools will boost your productivity.",
    isPublic: true,
    isFeatured: true,
    color: "#3b82f6",
    toolSlugs: ["github-copilot", "cursor", "tabnine", "anthropic-code", "codeium"],
  },
  {
    name: "AI Image Generators",
    slug: "ai-image-generators",
    description: "Create stunning images with AI. From art to marketing visuals, these tools bring your imagination to life.",
    isPublic: true,
    isFeatured: false,
    color: "#8b5cf6",
    toolSlugs: ["midjourney", "dall-e", "stable-diffusion", "adobe-firefly", "leonardo-ai"],
  },
  {
    name: "AI Writing Assistants",
    slug: "ai-writing-assistants",
    description: "Write better, faster with AI. Whether you're crafting emails, blog posts, or marketing copy.",
    isPublic: true,
    isFeatured: false,
    color: "#f59e0b",
    toolSlugs: ["jasper", "copy-ai", "writesonic", "anyword", "peppertype"],
  },
  {
    name: "Web3 & Crypto AI Tools",
    slug: "web3-crypto-ai",
    description: "AI tools specifically useful for Web3 developers, crypto traders, and blockchain enthusiasts.",
    isPublic: true,
    isFeatured: false,
    color: "#14b8a6",
    toolSlugs: ["chatgpt", "claude", "nifty-apps", "cryptocupid", "web3growth"],
  },
]

async function main() {
  console.log("⏳ Seeding collections...")

  try {
    let totalToolsAdded = 0

    for (const collectionData of defaultCollections) {
      const { toolSlugs, ...collectionFields } = collectionData

      // Create or update collection
      const collection = await prisma.toolCollection.upsert({
        where: { slug: collectionFields.slug },
        update: collectionFields,
        create: collectionFields,
      })

      console.log(`  📁 Collection: ${collection.name} (${collection.slug})`)

      // Find tools by slug
      const tools = await prisma.aITool.findMany({
        where: { slug: { in: toolSlugs } },
        select: { id: true, name: true, slug: true },
      })

      const foundSlugs = new Set(tools.map((t) => t.slug))
      const missingSlugs = toolSlugs.filter((s) => !foundSlugs.has(s))

      if (missingSlugs.length > 0) {
        console.log(`    ⚠️  Tools not found: ${missingSlugs.join(", ")}`)
      }

      // Add tools to collection
      for (let i = 0; i < tools.length; i++) {
        const tool = tools[i]
        await prisma.toolCollectionItem.upsert({
          where: {
            collectionId_toolId: {
              collectionId: collection.id,
              toolId: tool.id,
            },
          },
          update: { order: i },
          create: {
            collectionId: collection.id,
            toolId: tool.id,
            order: i,
          },
        })
        totalToolsAdded++
      }

      console.log(`    ✅ Added ${tools.length} tools to collection`)
    }

    // Get final count
    const collectionCount = await prisma.toolCollection.count()
    const itemCount = await prisma.toolCollectionItem.count()

    console.log(`\n✅ Successfully seeded collections`)
    console.log(`📊 Total collections: ${collectionCount}`)
    console.log(`📊 Total collection items: ${itemCount}`)
  } catch (error) {
    console.error("❌ Error seeding collections:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const count = await p.post.count()
  console.log(`Total posts: ${count}`)
  if (count > 0) {
    const posts = await p.post.findMany({ select: { slug: true, category: true, language: true, published: true }, take: 5 })
    for (const p of posts) console.log(JSON.stringify(p))
  }
}
main().finally(() => p.$disconnect())

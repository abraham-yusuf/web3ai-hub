import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const posts = await p.post.findMany({ select: { slug: true, title: true, category: true, published: true }, orderBy: { createdAt: 'desc' }, take: 15 })
  for (const post of posts) {
    console.log(`pub=${post.published} slug="${post.slug}" cat="${post.category}"`)
  }
  console.log(`\nTotal: ${posts.length}`)
}
main().finally(() => p.$disconnect())

import { PrismaClient } from '@prisma/client'
const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
async function main() {
  const posts = await p.post.findMany({ select: { slug: true, title: true, category: true }, take: 10, orderBy: { createdAt: 'desc' } })
  for (const post of posts) {
    console.log(`slug="${post.slug}" | cat="${post.category}" | title="${post.title}"`)
  }
}
main().finally(() => p.$disconnect())

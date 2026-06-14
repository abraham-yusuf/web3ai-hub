import { inngest } from "../client"
// Migrate from HTTP cron to Inngest function
export const scheduledPublish = inngest.createFunction(
  { id: "scheduled-publish", name: "Scheduled Post Publisher" },
  { cron: "*/5 * * * *" }, // every 5 minutes
  async ({ step }) => {
    const result = await step.run("publish-scheduled-posts", async () => {
      // Calls the existing API route logic inline
      const { prisma } = await import("@/lib/prisma")
      const now = new Date()
      const posts = await prisma.post.findMany({
        where: { status: "APPROVED", scheduledFor: { lte: now }, published: false }
      })
      for (const post of posts) {
        await prisma.post.update({
          where: { id: post.id },
          data: { published: true, status: "PUBLISHED", publishedAt: now }
        })
      }
      return { published: posts.length }
    })
    return result
  }
)

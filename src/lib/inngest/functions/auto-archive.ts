import { inngest } from "../client"
export const autoArchive = inngest.createFunction(
  { id: "auto-archive", name: "Auto Archive Old Opinion Posts", triggers: [{ cron: "0 2 * * *" }] },
  async ({ step }) => {
    const result = await step.run("archive-old-posts", async () => {
      const { prisma } = await import("@/lib/prisma")
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 90)
      const archived = await prisma.post.updateMany({
        where: {
          category: { in: ["opinion", "news", "opinion-news"] },
          publishedAt: { lte: cutoff },
          status: "PUBLISHED",
          archivedAt: null
        },
        data: { status: "ARCHIVED", archivedAt: new Date() }
      })
      return { archived: archived.count }
    })
    return result
  }
)

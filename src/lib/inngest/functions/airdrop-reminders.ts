import { inngest } from "../client"
export const airdropReminders = inngest.createFunction(
  { id: "airdrop-reminders", name: "Airdrop Deadline Reminders" },
  { cron: "0 9 * * *" }, // daily at 9am
  async ({ step }) => {
    const result = await step.run("send-deadline-reminders", async () => {
      const { prisma } = await import("@/lib/prisma")
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const urgentAirdrops = await prisma.airdrop.findMany({
        where: { deadline: { lte: tomorrow, gte: new Date() }, status: "ACTIVE" },
        select: { id: true, name: true, deadline: true }
      })
      // TODO: Create notifications for subscribed users
      console.log(`[airdrop-reminders] Found ${urgentAirdrops.length} airdrops ending soon`)
      return { reminders: urgentAirdrops.length }
    })
    return result
  }
)

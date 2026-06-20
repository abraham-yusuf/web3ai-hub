import { inngest } from "../client"
import { env } from "@/lib/env"
import { formatDistanceToNow } from "date-fns"

export const airdropReminders = inngest.createFunction(
  { id: "airdrop-reminders", name: "Airdrop Deadline Reminders", triggers: [{ cron: "0 9 * * *" }] },
  async ({ step }) => {
    const result = await step.run("fetch-urgent-airdrops", async () => {
      const { prisma } = await import("@/lib/prisma")
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const urgentAirdrops = await prisma.airdrop.findMany({
        where: {
          deadline: { lte: tomorrow, gte: new Date() },
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          network: true,
          deadline: true,
          difficulty: true,
          estimatedReward: true,
        },
      })

      return { urgentAirdrops }
    })

    await step.run("send-discord-reminders", async () => {
      const { sendDiscordAirdropDeadlineReminder } = await import("@/lib/discord")
      const appUrl = env.NEXT_PUBLIC_APP_URL || "https://web3aihub.com"

      for (const airdrop of result.urgentAirdrops) {
        const hoursRemaining = airdrop.deadline
          ? Math.round((airdrop.deadline.getTime() - Date.now()) / (1000 * 60 * 60))
          : 24

        await sendDiscordAirdropDeadlineReminder({
          airdropName: airdrop.name,
          network: airdrop.network,
          hoursRemaining,
          url: `${appUrl}/airdrop/${airdrop.slug}`,
        })
      }
    })

    await step.run("send-telegram-reminders", async () => {
      const { sendTelegramAirdropDeadlineReminder } = await import("@/lib/telegram")
      const appUrl = env.NEXT_PUBLIC_APP_URL || "https://web3aihub.com"

      for (const airdrop of result.urgentAirdrops) {
        const hoursRemaining = airdrop.deadline
          ? Math.round((airdrop.deadline.getTime() - Date.now()) / (1000 * 60 * 60))
          : 24

        await sendTelegramAirdropDeadlineReminder({
          airdropName: airdrop.name,
          network: airdrop.network,
          hoursRemaining,
          url: `${appUrl}/airdrop/${airdrop.slug}`,
        })
      }
    })

    return { reminders: result.urgentAirdrops.length }
  }
)

export const newAirdropNotification = inngest.createFunction(
  { id: "new-airdrop-notification", name: "New Airdrop Notification", triggers: [{ event: "airdrop/created" }] },
  async ({ event, step }) => {
    const { airdrop } = event.data

    await step.run("send-discord-notification", async () => {
      const { sendDiscordAirdropAlert } = await import("@/lib/discord")
      const appUrl = env.NEXT_PUBLIC_APP_URL || "https://web3aihub.com"

      await sendDiscordAirdropAlert({
        airdropName: airdrop.name,
        network: airdrop.network,
        deadline: airdrop.deadline
          ? formatDistanceToNow(new Date(airdrop.deadline), { addSuffix: true })
          : "TBD",
        url: `${appUrl}/airdrop/${airdrop.slug}`,
        difficulty: airdrop.difficulty,
        estimatedReward: airdrop.estimatedReward,
      })
    })

    await step.run("send-telegram-notification", async () => {
      const { sendTelegramAirdropAlert } = await import("@/lib/telegram")
      const appUrl = env.NEXT_PUBLIC_APP_URL || "https://web3aihub.com"

      await sendTelegramAirdropAlert({
        airdropName: airdrop.name,
        network: airdrop.network,
        deadline: airdrop.deadline
          ? formatDistanceToNow(new Date(airdrop.deadline), { addSuffix: true })
          : "TBD",
        url: `${appUrl}/airdrop/${airdrop.slug}`,
        difficulty: airdrop.difficulty,
        estimatedReward: airdrop.estimatedReward,
      })
    })

    return { notified: true, airdrop: airdrop.name }
  }
)
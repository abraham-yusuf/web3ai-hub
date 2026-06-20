import { inngest } from "../client"

export const telegramNotifications = inngest.createFunction(
  { id: "telegram-notifications", name: "Telegram Notifications", triggers: [{ event: "notification/telegram" }] },
  async ({ event, step }) => {
    const { type, data } = event.data

    await step.run("send-telegram-notification", async () => {
      const {
        sendTelegramAirdropAlert,
        sendTelegramNewPost,
        sendTelegramUserNotification,
        sendTelegramAirdropDeadlineReminder,
      } = await import("@/lib/telegram")

      switch (type) {
        case "airdrop":
          await sendTelegramAirdropAlert(data)
          break
        case "post":
          await sendTelegramNewPost(data)
          break
        case "user_notification":
          await sendTelegramUserNotification(data)
          break
        case "deadline_reminder":
          await sendTelegramAirdropDeadlineReminder(data)
          break
      }
    })

    return { sent: true, type }
  }
)

export async function triggerTelegramNotification(
  type: string,
  data: Record<string, string | number>
) {
  const { inngest: inngestClient } = await import("@/lib/inngest/client")
  await inngestClient.send({
    name: "notification/telegram",
    data: { type, data },
  })
}
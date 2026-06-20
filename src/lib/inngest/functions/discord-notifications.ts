import { inngest } from "../client"

export const discordNotifications = inngest.createFunction(
  { id: "discord-notifications", name: "Discord Notifications", triggers: [{ event: "notification/discord" }] },
  async ({ event, step }) => {
    const { type, data } = event.data

    await step.run("send-discord-notification", async () => {
      const { sendDiscordAirdropAlert, sendDiscordNewPost, sendDiscordCommunityUpdate } =
        await import("@/lib/discord")

      switch (type) {
        case "airdrop":
          await sendDiscordAirdropAlert(data)
          break
        case "post":
          await sendDiscordNewPost(data)
          break
        case "announcement":
        case "maintenance":
        case "update":
          await sendDiscordCommunityUpdate({ ...data, type })
          break
      }
    })

    return { sent: true, type }
  }
)

export async function triggerDiscordNotification(
  type: string,
  data: Record<string, string>
) {
  const { inngest: inngestClient } = await import("@/lib/inngest/client")
  await inngestClient.send({
    name: "notification/discord",
    data: { type, data },
  })
}
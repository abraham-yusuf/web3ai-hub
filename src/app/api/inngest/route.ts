import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { scheduledPublish } from "@/lib/inngest/functions/scheduled-publish"
import { autoArchive } from "@/lib/inngest/functions/auto-archive"
import { airdropReminders, newAirdropNotification } from "@/lib/inngest/functions/airdrop-reminders"
import { discordNotifications } from "@/lib/inngest/functions/discord-notifications"
import { telegramNotifications } from "@/lib/inngest/functions/telegram-notifications"

export const dynamic = "force-dynamic"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scheduledPublish,
    autoArchive,
    airdropReminders,
    newAirdropNotification,
    discordNotifications,
    telegramNotifications,
  ],
})

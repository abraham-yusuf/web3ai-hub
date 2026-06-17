import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { scheduledPublish } from "@/lib/inngest/functions/scheduled-publish"
import { autoArchive } from "@/lib/inngest/functions/auto-archive"
import { airdropReminders } from "@/lib/inngest/functions/airdrop-reminders"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scheduledPublish, autoArchive, airdropReminders],
})

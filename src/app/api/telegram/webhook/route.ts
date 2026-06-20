import { NextRequest, NextResponse } from "next/server"
import { sendTelegramMainMenu, answerTelegramCallbackQuery } from "@/lib/telegram"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, callback_query } = body

    if (callback_query) {
      const { id, data, from } = callback_query
      console.log(`[telegram/webhook] Callback query from ${from?.username}: ${data}`)

      if (data?.startsWith("airdrop_")) {
        const airdropSlug = data.replace("airdrop_", "")
        await answerTelegramCallbackQuery(id, `Opening airdrop: ${airdropSlug}`)
      } else if (data === "main_menu") {
        await sendTelegramMainMenu(from?.id)
        await answerTelegramCallbackQuery(id)
      } else {
        await answerTelegramCallbackQuery(id, "Coming soon!")
      }

      return NextResponse.json({ ok: true })
    }

    if (message) {
      const { chat, text, from } = message
      const chatId = chat.id

      console.log(`[telegram/webhook] Message from ${from?.username} (${chatId}): ${text}`)

      if (text === "/start" || text === "/menu") {
        await sendTelegramMainMenu(chatId)
        return NextResponse.json({ ok: true })
      }

      if (text?.startsWith("/airdrop ")) {
        const airdropSlug = text.replace("/airdrop ", "").trim()
        const airdropUrl = `${env.NEXT_PUBLIC_APP_URL}/airdrop/${airdropSlug}`
        try {
          const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/airdrop/${airdropSlug}`)
          if (res.ok) {
            const airdrop = await res.json()
            if (airdrop && airdrop.name) {
              const msg = `🪂 <b>${airdrop.name}</b>\n\n🌐 Network: ${airdrop.network}\n📊 Status: ${airdrop.status}\n${airdrop.deadline ? `⏰ Deadline: ${airdrop.deadline}` : ""}\n\n<a href="${airdropUrl}">View Details →</a>`
              const { sendTelegramMessage } = await import("@/lib/telegram")
              await sendTelegramMessage(chatId, msg, { parseMode: "HTML" })
            }
          } else {
            const { sendTelegramMessage } = await import("@/lib/telegram")
            await sendTelegramMessage(chatId, "Airdrop not found. Check the slug and try again.")
          }
        } catch {
          const { sendTelegramMessage } = await import("@/lib/telegram")
          await sendTelegramMessage(chatId, "Airdrop not found. Check the slug and try again.")
        }
        return NextResponse.json({ ok: true })
      }

      if (text?.startsWith("/help")) {
        const helpMsg = `
<b>Web3AI Hub Bot Commands</b>

/start - Show main menu
/menu - Show main menu
/airdrop [slug] - Get airdrop info
/help - Show this help

You'll receive notifications when:
🪂 New airdrops are listed
⏰ Airdrop deadlines are approaching
📝 New blog posts are published
`.trim()
        const { sendTelegramMessage } = await import("@/lib/telegram")
        await sendTelegramMessage(chatId, helpMsg, { parseMode: "HTML" })
        return NextResponse.json({ ok: true })
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[telegram/webhook] Error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
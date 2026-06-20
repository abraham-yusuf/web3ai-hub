import { env } from "@/lib/env"

interface TelegramMessage {
  chat_id: string | number
  text: string
  parse_mode?: "HTML" | "MarkdownV2"
  disable_web_page_preview?: boolean
  reply_markup?: TelegramInlineKeyboard
}

interface TelegramInlineKeyboard {
  inline_keyboard: TelegramButton[][]
}

interface TelegramButton {
  text: string
  url?: string
  callback_data?: string
}

function getTelegramConfig() {
  const botToken = env.TELEGRAM_BOT_TOKEN
  const adminChatId = env.TELEGRAM_ADMIN_CHAT_ID
  const announcementsChannelId = env.TELEGRAM_ANNOUNCEMENTS_CHANNEL_ID

  if (!botToken) return null
  return { botToken, adminChatId, announcementsChannelId }
}

async function telegramApi(method: string, params: Record<string, unknown>): Promise<unknown> {
  const config = getTelegramConfig()
  if (!config) {
    console.warn("[telegram] BOT_TOKEN not configured, skipping API call")
    return null
  }

  const url = `https://api.telegram.org/bot${config.botToken}/${method}`
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (!data.ok) {
      console.error(`[telegram] API error ${method}:`, data.description)
    }
    return data
  } catch (error) {
    console.error(`[telegram] Failed to call ${method}:`, error)
    return null
  }
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: { parseMode?: "HTML" | "MarkdownV2"; replyMarkup?: TelegramInlineKeyboard }
): Promise<boolean> {
  const result = await telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options?.parseMode || "HTML",
    disable_web_page_preview: true,
    reply_markup: options?.replyMarkup,
  })
  return result ? (result as { ok: boolean }).ok : false
}

export async function sendTelegramAirdropAlert(params: {
  airdropName: string
  network: string
  deadline: string
  url: string
  difficulty: string
  estimatedReward?: string
}): Promise<boolean> {
  const config = getTelegramConfig()
  if (!config?.announcementsChannelId) {
    console.warn("[telegram] TELEGRAM_ANNOUNCEMENTS_CHANNEL_ID not configured")
    return false
  }

  const difficultyEmoji: Record<string, string> = {
    EASY: "🟢",
    MEDIUM: "🟡",
    HARD: "🔴",
    SCAM: "⚫",
  }
  const emoji = difficultyEmoji[params.difficulty] || "⚪"

  const message = `
${emoji} <b>Airdrop Alert: ${params.airdropName}</b>

🌐 <b>Network:</b> ${params.network}
⏰ <b>Deadline:</b> ${params.deadline}
📊 <b>Difficulty:</b> ${params.difficulty}${params.estimatedReward ? `\n💰 <b>Est. Reward:</b> ${params.estimatedReward}` : ""}

<a href="${params.url}">View Details →</a>
`.trim()

  return sendTelegramMessage(config.announcementsChannelId, message, {
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [[{ text: "📋 View Airdrop", url: params.url }]],
    },
  })
}

export async function sendTelegramNewPost(params: {
  title: string
  excerpt: string
  url: string
  category: string
  authorName: string
}): Promise<boolean> {
  const config = getTelegramConfig()
  if (!config?.announcementsChannelId) return false

  const categoryEmoji: Record<string, string> = {
    "web3-fundamentals": "🔷",
    "ai-tutorials": "🤖",
    "airdrop-guides": "🪂",
    "opinion-news": "📰",
  }
  const emoji = categoryEmoji[params.category] || "📝"

  const message = `
${emoji} <b>New Post: ${params.title}</b>

${params.excerpt}

👤 Author: ${params.authorName}
📁 Category: ${params.category.replace("-", " ")}

<a href="${params.url}">Read More →</a>
`.trim()

  return sendTelegramMessage(config.announcementsChannelId, message, {
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [[{ text: "📖 Read Article", url: params.url }]],
    },
  })
}

export async function sendTelegramAirdropDeadlineReminder(params: {
  airdropName: string
  network: string
  hoursRemaining: number
  url: string
}): Promise<boolean> {
  const config = getTelegramConfig()
  if (!config?.announcementsChannelId) return false

  const message = `
🚨 <b>Airdrop Deadline Alert!</b>

<b>${params.airdropName}</b> on ${params.network} ends in <b>${params.hoursRemaining} hours</b>!

Don't miss out on this airdrop. Complete your tasks now!
<a href="${params.url}">Complete Tasks →</a>
`.trim()

  return sendTelegramMessage(config.announcementsChannelId, message, {
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [[{ text: "✅ Complete Tasks Now", url: params.url }]],
    },
  })
}

export async function sendTelegramUserNotification(params: {
  telegramChatId: string | number
  title: string
  message: string
  url?: string
}): Promise<boolean> {
  const message = `<b>${params.title}</b>\n\n${params.message}${params.url ? `\n\n<a href="${params.url}">View →</a>` : ""}`
  return sendTelegramMessage(params.telegramChatId, message, {
    parseMode: "HTML",
    replyMarkup: params.url
      ? { inline_keyboard: [[{ text: "View", url: params.url }]] }
      : undefined,
  })
}

export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  const result = await telegramApi("setWebhook", { url: webhookUrl })
  return result ? (result as { ok: boolean }).ok : false
}

export async function getTelegramWebhookInfo(): Promise<unknown> {
  return telegramApi("getWebhookInfo", {})
}

export async function sendTelegramMainMenu(chatId: string | number): Promise<boolean> {
  const message = `
👋 <b>Welcome to Web3AI Hub Bot!</b>

Here's what you can do:

🪂 <b>Airdrops</b> — Get notified about new airdrops and deadline reminders
📝 <b>Blog Posts</b> — Receive notifications when new articles are published
💰 <b>Premium</b> — Learn about premium features

━━━━━━━━━━━━━━━
To receive airdrop alerts, make sure your account is subscribed!
`.trim()

  return sendTelegramMessage(chatId, message, {
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🪂 Browse Airdrops", url: `${env.NEXT_PUBLIC_APP_URL}/airdrop` }],
        [{ text: "📝 Latest Posts", url: `${env.NEXT_PUBLIC_APP_URL}/blog` }],
        [{ text: "💎 Premium Features", url: `${env.NEXT_PUBLIC_APP_URL}/pricing` }],
      ],
    },
  })
}

export async function answerTelegramCallbackQuery(callbackQueryId: string, text?: string): Promise<boolean> {
  const result = await telegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  })
  return result ? (result as { ok: boolean }).ok : false
}
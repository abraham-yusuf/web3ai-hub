import { env } from "@/lib/env"

interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  color?: number
  author?: { name: string; url?: string; icon_url?: string }
  thumbnail?: { url: string }
  image?: { url: string }
  fields?: { name: string; value: string; inline?: boolean }[]
  footer?: { text: string; icon_url?: string }
  timestamp?: string
}

interface DiscordMessage {
  content?: string
  embeds?: DiscordEmbed[]
  components?: DiscordComponent[]
}

interface DiscordComponent {
  type: number
  components?: DiscordButtonComponent[]
}

interface DiscordButtonComponent {
  type: number
  style: number
  label: string
  url?: string
  emoji?: { name: string }
}

const DISCORD_BUTTON_TYPE = 2
const DISCORD_BUTTON_STYLE_LINK = 5

export function buildDiscordClient() {
  const webhookUrl = env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return null
  return { webhookUrl }
}

async function sendToDiscord(message: DiscordMessage, webhookUrl: string): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })
    return res.ok
  } catch (error) {
    console.error("[discord] Failed to send message:", error)
    return false
  }
}

export async function sendDiscordEmbed(embed: DiscordEmbed): Promise<boolean> {
  const client = buildDiscordClient()
  if (!client) {
    console.warn("[discord] DISCORD_WEBHOOK_URL not configured, skipping message")
    return false
  }
  return sendToDiscord({ embeds: [embed] }, client.webhookUrl)
}

export async function sendDiscordAirdropAlert(params: {
  airdropName: string
  network: string
  deadline: string
  url: string
  difficulty: string
  estimatedReward?: string
}): Promise<boolean> {
  const client = buildDiscordClient()
  if (!client) return false

  const difficultyColors: Record<string, number> = {
    EASY: 0x22c55e,
    MEDIUM: 0xf59e0b,
    HARD: 0xef4444,
    SCAM: 0xdc2626,
  }
  const color = difficultyColors[params.difficulty] || 0x6b7280

  const embed: DiscordEmbed = {
    title: `🪂 ${params.airdropName}`,
    description: `Network: **${params.network}** | Difficulty: ${params.difficulty}${params.estimatedReward ? ` | Est. Reward: ${params.estimatedReward}` : ""}`,
    url: params.url,
    color,
    fields: [
      { name: "⏰ Deadline", value: params.deadline, inline: true },
      { name: "📋 Status", value: "Active", inline: true },
    ],
    footer: { text: "Web3AI Hub • Airdrop Alert" },
    timestamp: new Date().toISOString(),
  }

  return sendToDiscord(
    {
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: DISCORD_BUTTON_TYPE,
              style: DISCORD_BUTTON_STYLE_LINK,
              label: "View Details",
              url: params.url,
            },
          ],
        },
      ],
    },
    client.webhookUrl
  )
}

export async function sendDiscordNewPost(params: {
  title: string
  excerpt: string
  url: string
  category: string
  authorName: string
}): Promise<boolean> {
  const client = buildDiscordClient()
  if (!client) return false

  const categoryColors: Record<string, number> = {
    "web3-fundamentals": 0x8b5cf6,
    "ai-tutorials": 0x06b6d4,
    "airdrop-guides": 0x22c55e,
    "opinion-news": 0xf59e0b,
  }
  const color = categoryColors[params.category] || 0x6b7280

  const embed: DiscordEmbed = {
    title: `📝 ${params.title}`,
    description: params.excerpt,
    url: params.url,
    color,
    author: { name: params.authorName, icon_url: `${env.NEXT_PUBLIC_APP_URL}/favicon.ico` },
    footer: { text: `Web3AI Hub • ${params.category.replace("-", " ")}` },
    timestamp: new Date().toISOString(),
  }

  return sendToDiscord(
    {
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: DISCORD_BUTTON_TYPE,
              style: DISCORD_BUTTON_STYLE_LINK,
              label: "Read More",
              url: params.url,
            },
          ],
        },
      ],
    },
    client.webhookUrl
  )
}

export async function sendDiscordAirdropDeadlineReminder(params: {
  airdropName: string
  network: string
  hoursRemaining: number
  url: string
}): Promise<boolean> {
  const client = buildDiscordClient()
  if (!client) return false

  const embed: DiscordEmbed = {
    title: `⚠️ Airdrop Deadline Alert: ${params.airdropName}`,
    description: `Only **${params.hoursRemaining} hours** left to complete tasks for **${params.network}** airdrop!`,
    url: params.url,
    color: 0xef4444,
    footer: { text: "Web3AI Hub • Don't miss your airdrop!" },
    timestamp: new Date().toISOString(),
  }

  return sendToDiscord(
    {
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: DISCORD_BUTTON_TYPE,
              style: DISCORD_BUTTON_STYLE_LINK,
              label: "Complete Tasks Now",
              url: params.url,
            },
          ],
        },
      ],
    },
    client.webhookUrl
  )
}

export async function sendDiscordCommunityUpdate(params: {
  title: string
  message: string
  type: "announcement" | "maintenance" | "update"
}): Promise<boolean> {
  const client = buildDiscordClient()
  if (!client) return false

  const typeConfig = {
    announcement: { color: 0x8b5cf6, emoji: "📢" },
    maintenance: { color: 0xf59e0b, emoji: "🔧" },
    update: { color: 0x06b6d4, emoji: "ℹ️" },
  }
  const config = typeConfig[params.type]

  const embed: DiscordEmbed = {
    title: `${config.emoji} ${params.title}`,
    description: params.message,
    color: config.color,
    footer: { text: "Web3AI Hub" },
    timestamp: new Date().toISOString(),
  }

  return sendToDiscord({ embeds: [embed] }, client.webhookUrl)
}
# Discord & Telegram Integration Setup

Panduan setup Discord dan Telegram bot untuk Web3AI Hub notifications.

## Table of Contents

- [Discord Integration](#discord-integration)
- [Telegram Integration](#telegram-integration)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Inngest Background Jobs](#inngest-background-jobs)

---

## Discord Integration

### Setup Discord Webhook (Announcements Only)

Cara paling sederhana untuk mengirim notifikasi ke Discord adalah via Webhook. Tidak butuh bot.

1. Buka Discord Server > Channel Settings > Integrations > Webhooks
2. Buat Webhook baru, copy URL-nya
3. Format Webhook URL: `https://discord.com/api/webhooks/{WEBHOOK_ID}/{TOKEN}`

```bash
# Tambahkan ke .env.local
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/your-webhook-id/your-token"
```

### Setup Discord Bot (For Interactive Commands)

Jika butuh command interaktif (slash commands), perlu bot:

1. Buka [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application > Buat nama (e.g., "Web3AI Hub Bot")
3. Buka Bot section > Reset Token > Copy token

```bash
# Tambahkan ke .env.local
DISCORD_BOT_TOKEN="your-bot-token-here"
```

4. Di Bot section, enable these **Privileged Gateway Intents**:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT

5. Generate invite link di OAuth2 > URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`

6. Invite bot ke server dengan link tersebut

---

## Telegram Integration

### Setup Telegram Bot

1. Buka [@BotFather](https://t.me/botfather) di Telegram
2. Kirim `/newbot`
3. Follow instructions (nama bot, username)
4. Copy the **bot token**: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`

```bash
# Tambahkan ke .env.local
TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
```

### Setup Telegram Channel for Announcements

1. Buat channel baru di Telegram (public atau private)
2. Add bot sebagai **admin** dengan permission `Post Messages`
3. Get channel ID:
   - Untuk private channel: forward message dari channel ke [@userinfobot](https://t.me/userinfobot)
   - Atau gunakan `@getidsbot`
   - Format: `-1001234567890` (negative number untuk channels)

```bash
# Tambahkan ke .env.local
TELEGRAM_ANNOUNCEMENTS_CHANNEL_ID="-1001234567890"
```

### Setup Admin Chat ID (Optional - for testing)

1. Chat dengan [@userinfobot](https://t.me/userinfobot)
2. Copy your **Chat ID** (positive number untuk individual chats)

```bash
# Tambahkan ke .env.local
TELEGRAM_ADMIN_CHAT_ID="123456789"
```

### Set Webhook for Telegram Bot

Setelah deploy, set webhook untuk receive updates:

```bash
# Webhook URL format (setelah production deployment)
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-domain.com/api/telegram/webhook"
```

Atau melalui browser:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook
```

---

## Environment Variables

Tambahkan variabel berikut ke `.env.local` (development) atau environment di Vercel (production):

```bash
# ---- Discord ----
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
DISCORD_BOT_TOKEN=""                    # Optional, only if using bot commands

# ---- Telegram ----
TELEGRAM_BOT_TOKEN="123456789:ABCdef..."
TELEGRAM_ADMIN_CHAT_ID="123456789"      # Your personal chat ID for testing
TELEGRAM_ANNOUNCEMENTS_CHANNEL_ID="-1001234567890"
```

### Full list of related env vars in `.env.example`:

```bash
# ---- Discord ----
DISCORD_WEBHOOK_URL=
DISCORD_BOT_TOKEN=

# ---- Telegram ----
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=
TELEGRAM_ANNOUNCEMENTS_CHANNEL_ID=
```

---

## API Endpoints

### Discord

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/discord/webhook` | Send Discord notification (airdrop, post, announcement) | Admin |

**Request body:**
```json
{
  "type": "airdrop|post|announcement|maintenance|update",
  "data": {
    "airdropName": "Example Airdrop",
    "network": "Ethereum",
    "deadline": "2 days",
    "url": "https://ai3.web.id/airdrop/example",
    "difficulty": "MEDIUM",
    "estimatedReward": "$100-$500"
  }
}
```

### Telegram

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/telegram/webhook` | Receive Telegram bot updates | Telegram |
| POST | `/api/telegram/send` | Send Telegram notification | Admin |
| GET | `/api/notifications/telegram/subscribe` | Get user's Telegram subscription | User |
| POST | `/api/notifications/telegram/subscribe` | Subscribe to Telegram notifications | User |
| DELETE | `/api/notifications/telegram/subscribe` | Unsubscribe from Telegram | User |

**Telegram Send Request body:**
```json
{
  "type": "airdrop|post|user_notification|deadline_reminder",
  "data": { ... }
}
```

### User Subscription

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications/discord` | Get Discord subscription status | User |
| POST | `/api/notifications/discord` | Subscribe to Discord notifications | User |
| DELETE | `/api/notifications/discord` | Unsubscribe from Discord | User |
| GET | `/api/notifications/telegram/subscribe` | Get Telegram subscription status | User |
| POST | `/api/notifications/telegram/subscribe` | Subscribe to Telegram notifications | User |
| DELETE | `/api/notifications/telegram/subscribe` | Unsubscribe from Telegram | User |

---

## Inngest Background Jobs

### Discord Notifications

Triggered by `notification/discord` event:

```typescript
import { triggerDiscordNotification } from '@/lib/inngest/functions/discord-notifications'

await triggerDiscordNotification('airdrop', {
  airdropName: 'Example Airdrop',
  network: 'Solana',
  deadline: 'in 3 days',
  url: 'https://ai3.web.id/airdrop/example',
  difficulty: 'EASY',
})
```

### Telegram Notifications

Triggered by `notification/telegram` event:

```typescript
import { triggerTelegramNotification } from '@/lib/inngest/functions/telegram-notifications'

await triggerTelegramNotification('airdrop', {
  airdropName: 'Example Airdrop',
  network: 'Solana',
  deadline: 'in 3 days',
  url: 'https://ai3.web.id/airdrop/example',
  difficulty: 'EASY',
})
```

### Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `airdrop-reminders` | Daily 09:00 UTC | Send deadline reminders for airdrops ending within 24h |
| `scheduledPublish` | Every 5 min | Publish scheduled blog posts |
| `autoArchive` | Daily 00:00 UTC | Auto-archive old opinion/news posts |

---

## Bot Commands

### Telegram Bot Commands

Users can interact with the bot using these commands:

| Command | Description |
|---------|-------------|
| `/start` | Show main menu |
| `/menu` | Show main menu |
| `/airdrop [slug]` | Get airdrop info by slug |
| `/help` | Show help message |

---

## Testing

### Test Discord Webhook

```bash
curl -X POST https://your-domain.com/api/discord/webhook \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "type": "announcement",
    "data": {
      "title": "Test Announcement",
      "message": "This is a test message from Web3AI Hub"
    }
  }'
```

### Test Telegram Bot

1. Send `/start` to your bot
2. Send `/help` to see available commands
3. Send `/airdrop solana-ecosystem` to get airdrop info

### Test Telegram Send API

```bash
curl -X POST https://your-domain.com/api/telegram/send \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "type": "airdrop",
    "data": {
      "airdropName": "Test Airdrop",
      "network": "Ethereum",
      "deadline": "2024-12-31",
      "url": "https://ai3.web.id/airdrop/test",
      "difficulty": "EASY"
    }
  }'
```

---

## Troubleshooting

### Discord Webhook Not Working

1. Check if `DISCORD_WEBHOOK_URL` is correctly set in environment
2. Verify webhook is still valid (not deleted from Discord)
3. Check Vercel logs for errors
4. Test webhook URL directly with curl

### Telegram Bot Not Responding

1. Verify `TELEGRAM_BOT_TOKEN` is correct
2. Ensure bot is added to the channel as admin
3. Check if webhook is set correctly:
   ```
   https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```
4. For group bots, make sure to start the bot first with `/start`

### Notifications Not Sending

1. Check Inngest dashboard for failed jobs
2. Verify environment variables are set in production
3. Check rate limits (Discord has rate limits for webhooks)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web3AI Hub                           │
├─────────────────────────────────────────────────────────┤
│  Admin Actions                                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ Create Airdrop│  │ Publish Post │                    │
│  └──────┬───────┘  └──────┬───────┘                    │
│         │                 │                            │
│         └────────┬────────┘                            │
│                  ▼                                     │
│         ┌───────────────┐                              │
│         │  Inngest      │                              │
│         │  Background   │                              │
│         │  Functions    │                              │
│         └───────┬───────┘                              │
│                 │                                      │
│     ┌───────────┴───────────┐                          │
│     ▼                       ▼                          │
│ ┌────────┐            ┌──────────┐                     │
│ │Discord │            │ Telegram │                     │
│ │Webhook │            │   Bot    │                     │
│ └────┬───┘            └────┬─────┘                     │
│      │                    │                            │
│      ▼                    ▼                            │
│ ┌─────────────────────────────┐                       │
│ │    Discord/Telegram         │                       │
│ │    Servers                  │                       │
│ └─────────────────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

---

## Security Notes

- Never commit bot tokens or webhook URLs to git
- Use Vercel environment variables for production
- Discord bot token requires `Guilds` and `GuildMessages` intents
- Telegram bot webhook should use HTTPS in production
- Admin API routes are protected by NextAuth session check
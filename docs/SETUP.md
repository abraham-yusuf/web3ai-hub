# 🛠️ Setup Guide — Web3AI Hub (AI3)

> **Panduan lengkap** untuk setup environment, dependencies, dan semua third-party services yang dibutuhkan project ini.

---

## 📋 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Database — Neon PostgreSQL](#database--neon-postgresql)
4. [Auth — NextAuth.js](#auth--nextauthjs)
5. [AI Providers](#ai-providers)
6. [Storage — Cloudflare R2](#storage--cloudflare-r2)
7. [Email — Resend](#email--resend)
8. [Analytics](#analytics)
9. [Monetization — Google AdSense](#monetization--google-adsense)
10. [Background Jobs — Inngest](#background-jobs--inngest)
11. [Caching — Upstash Redis](#caching--upstash-redis)
12. [Error Tracking — Sentry](#error-tracking--sentry)
13. [Webhooks & Cron Secrets](#webhooks--cron-secrets)
14. [Deployment ke Vercel](#deployment-ke-vercel)
15. [Environment Variables Checklist](#environment-variables-checklist)

---

## Prerequisites

Pastikan sudah terinstall:

| Tool | Versi minimum | Link |
|------|--------------|------|
| Node.js | v20+ | https://nodejs.org |
| npm | v10+ | (bundled with Node.js) |
| Git | latest | https://git-scm.com |
| PostgreSQL (local dev) | v14+ | https://www.postgresql.org atau gunakan Neon |

---

## Quick Start

```bash
# 1. Clone repo
git clone https://github.com/abraham-yusuf/web3ai-hub.git
cd web3ai-hub

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Generate NEXTAUTH_SECRET (wajib)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# → Paste hasilnya ke NEXTAUTH_SECRET di .env.local

# 5. Generate AI encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# → Paste hasilnya ke AI_SETTINGS_ENCRYPTION_KEY

# 6. Run database migration
npx prisma generate
npx prisma db push

# 7. Seed database (optional, untuk data awal)
npm run db:seed

# 8. Buat admin user
npm run db:create-admin

# 9. Jalankan development server
npm run dev
# → Buka http://localhost:3000
```

---

## Database — Neon PostgreSQL

> **Wajib.** Semua data platform tersimpan di PostgreSQL.

### Option A: Neon (Rekomendasi — Free tier tersedia)

1. Daftar di **https://neon.tech** (gratis, tidak perlu kartu kredit)
2. Buat project baru → pilih region terdekat (Singapore)
3. Setelah project dibuat, klik **Dashboard** → **Connection Details**
4. Salin **Connection string** (format: `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`)

```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

> **Catatan:** Untuk Prisma Accelerate (connection pooling), gunakan URL dari Prisma Data Platform sebagai `DATABASE_URL` dan direct URL Neon sebagai `DIRECT_URL`.

### Option B: Local PostgreSQL

```bash
# Buat database lokal
createdb web3ai_hub
```

```env
DATABASE_URL="postgresql://localhost:5432/web3ai_hub"
DIRECT_URL="postgresql://localhost:5432/web3ai_hub"
```

---

## Auth — NextAuth.js

> **Wajib.** Untuk login admin dan user sessions.

### 1. Generate NEXTAUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Contoh output: m7K8vNpQ2xR5uY1wE3tA6sD9bF4cG0hJ2kL8mN5pQ7rS=
```

```env
NEXTAUTH_SECRET="m7K8vNpQ2xR5uY1wE3tA6sD9bF4cG0hJ2kL8mN5pQ7rS="
NEXTAUTH_URL="http://localhost:3000"  # Ganti ke domain production saat deploy
```

### 2. Bootstrap Admin (Setup Awal)

> Hanya untuk login pertama kali. Setelah membuat admin user via DB, hapus atau ganti credentials ini.

```env
ADMIN_EMAIL="admin@ai3.web.id"
ADMIN_PASSWORD="ganti-sekarang-juga"
```

### 3. Buat Admin User Permanen

```bash
npm run db:create-admin
# Mengikuti prompts: masukkan email, password, dan nama
```

---

## AI Providers

> **Minimal satu wajib** untuk fitur AI Writer, Learn Chat, dan konten generation.

### OpenAI (Rekomendasi utama)

1. Buka **https://platform.openai.com**
2. Klik avatar → **API Keys** → **Create new secret key**
3. Beri nama: `web3ai-hub`
4. Salin key (hanya tampil sekali!)

```env
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

> **Model yang digunakan:** `gpt-4o` (default), `gpt-4o-mini` (hemat). Pastikan akun sudah memiliki saldo/billing.

### Anthropic Claude

1. Buka **https://console.anthropic.com**
2. **API Keys** → **Create Key**

```env
ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx"
```

### Google AI (Gemini)

1. Buka **https://aistudio.google.com**
2. Klik **Get API key** → **Create API key in new project**

```env
GOOGLE_AI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### Groq (Tercepat, gratis tier besar)

1. Buka **https://console.groq.com**
2. **API Keys** → **Create API Key**

```env
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### AI Settings Encryption Key

Digunakan untuk mengenkripsi API key yang disimpan di database melalui admin panel.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```env
AI_SETTINGS_ENCRYPTION_KEY="base64-encoded-32-byte-key-here="
```

---

## Storage — Cloudflare R2

> **Opsional.** Untuk upload gambar cover blog, logo tools, screenshots. Jika tidak dikonfigurasi, upload gambar tidak tersedia.

### Setup Cloudflare R2

1. Daftar/login di **https://dash.cloudflare.com**
2. Sidebar → **R2 Object Storage** → **Create bucket**
   - Nama bucket: `web3ai-hub-media` (atau sesuai keinginan)
   - Region: Automatic
3. Buka **R2 Overview** → **Manage R2 API Tokens** → **Create API Token**
   - Permissions: **Object Read & Write**
   - Specify bucket: pilih bucket yang baru dibuat
4. Salin **Access Key ID** dan **Secret Access Key** (hanya tampil sekali)
5. **Account ID** tersedia di bagian kanan halaman R2 Overview

```env
R2_ACCOUNT_ID="abcdef1234567890abcdef1234567890"
R2_ACCESS_KEY_ID="abc123def456ghi789"
R2_SECRET_ACCESS_KEY="AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEf"
R2_BUCKET_NAME="web3ai-hub-media"
```

> **Tip:** Aktifkan juga **Public Access** di bucket settings jika ingin gambar bisa diakses langsung via URL public. Atau gunakan Cloudflare Workers untuk custom domain.

---

## Email — Resend

> **Opsional tapi direkomendasikan.** Untuk newsletter, notifikasi email, welcome email subscriber.

### Setup Resend

1. Daftar di **https://resend.com** (free tier: 3.000 email/bulan)
2. Dashboard → **API Keys** → **Create API Key**
   - Name: `web3ai-hub`
   - Permission: **Full access** (atau Sending access)
3. **Add Domain** → masukkan domain kamu (`ai3.web.id`)
   - Ikuti petunjuk untuk menambahkan DNS records (MX, SPF, DKIM) di Cloudflare/registrar
   - Verifikasi domain (proses 5-10 menit)

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

> **From address** default: `noreply@ai3.web.id`. Pastikan domain sudah terverifikasi sebelum mengirim email.

---

## Analytics

> **Semua opsional.** Untuk tracking traffic dan performa SEO.

### Google Analytics 4

1. Buka **https://analytics.google.com**
2. **Admin** → **Create property** → ikuti wizard
3. **Data streams** → **Web** → masukkan URL website
4. Salin **Measurement ID** (format: `G-XXXXXXXXXX`)

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-ABCD1234EF"
```

### Google Search Console Verification

1. Buka **https://search.google.com/search-console**
2. **Add property** → masukkan domain
3. Pilih metode verifikasi **HTML tag**
4. Salin nilai `content=` dari meta tag yang diberikan

```env
NEXT_PUBLIC_GSC_VERIFICATION="abc123def456ghi789"
```

### Umami Analytics (Self-hosted, Privacy-first)

Alternatif Google Analytics yang ringan dan GDPR-compliant.

1. Deploy Umami di Railway/Vercel/VPS: **https://umami.is/docs/install**
2. Tambahkan website di Umami dashboard
3. Salin **Website ID** dan **Umami URL**

```env
NEXT_PUBLIC_UMAMI_WEBSITE_ID="12345678-1234-1234-1234-123456789012"
NEXT_PUBLIC_UMAMI_URL="https://umami.yourdomain.com"
```

---

## Monetization — Google AdSense

> **Opsional.** Untuk tampilkan iklan di halaman blog dan tools.

1. Daftar/login di **https://adsense.google.com**
2. **Sites** → **Add site** → masukkan domain
3. Tunggu review Google (bisa 1-14 hari)
4. Setelah approved, pergi ke **Account** → Publisher ID
   - Format: `ca-pub-XXXXXXXXXXXXXXXXXX` (16 digit)

```env
NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-1234567890123456"
```

---

## Background Jobs — Inngest

> **Opsional.** Untuk background jobs otomatis: scheduled publish, auto-archive, airdrop reminders. Tanpa ini, cron harus dijalankan manual via HTTP.

### Setup Inngest

1. Daftar di **https://www.inngest.com** (free tier tersedia)
2. **Create new app** → nama: `web3ai-hub`
3. **Event Keys** → **Create Event Key**
   - Salin `INNGEST_EVENT_KEY`
4. **Signing Keys** → Salin `INNGEST_SIGNING_KEY` (auto-generated)

```env
INNGEST_EVENT_KEY="signkey-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
INNGEST_SIGNING_KEY="signkey-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Daftarkan endpoint di Inngest

Setelah deploy ke Vercel, daftarkan endpoint Inngest:

1. Inngest Dashboard → **Apps** → **Sync new app**
2. Masukkan URL: `https://ai3.web.id/api/inngest`
3. Klik **Sync**

Inngest akan secara otomatis menemukan 3 background functions:
- `scheduled-publish` — setiap 5 menit, publish post yang sudah waktunya
- `auto-archive` — setiap hari jam 2 pagi, archive opinion/news > 90 hari
- `airdrop-reminders` — setiap hari jam 9 pagi, kirim reminder deadline airdrop

---

## Caching — Upstash Redis

> **Opsional tapi direkomendasikan untuk production.** Untuk caching API responses, AI response deduplication, dan rate limiting yang persisten.

### Setup Upstash Redis

1. Daftar di **https://upstash.com** (free tier: 10.000 request/hari)
2. **Redis** → **Create Database**
   - Name: `web3ai-hub-cache`
   - Region: `ap-southeast-1` (Singapore — terdekat)
   - Type: **Regional** (untuk produksi); **Global** jika mau multi-region
3. Setelah database dibuat, buka tab **REST API**
4. Salin **UPSTASH_REDIS_REST_URL** dan **UPSTASH_REDIS_REST_TOKEN**

```env
UPSTASH_REDIS_REST_URL="https://xxx-xxx-xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx"
```

> **Tanpa Upstash:** Caching akan otomatis fallback ke in-memory cache (tidak persisten antar restart, cocok untuk development).

---

## Error Tracking — Sentry

> **Opsional tapi direkomendasikan untuk production.** Untuk mendeteksi dan track errors di client, server, dan edge runtime.

### Setup Sentry

1. Daftar di **https://sentry.io** (free tier: 5.000 error/bulan)
2. **Create Project** → pilih **Next.js**
   - Project name: `web3ai-hub`
   - Team: pilih atau buat tim
3. Setelah project dibuat, salin **DSN** dari halaman Getting Started
   - Format: `https://xxxxx@xxx.ingest.sentry.io/xxxxxxx`
4. Untuk **SENTRY_AUTH_TOKEN** (diperlukan untuk source maps upload saat build):
   - **Settings** → **Auth Tokens** → **Create New Token**
   - Scope: `project:releases`, `org:read`

```env
NEXT_PUBLIC_SENTRY_DSN="https://abcdef1234567890@o123456.ingest.sentry.io/1234567"
SENTRY_AUTH_TOKEN="sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

> **Catatan:** `NEXT_PUBLIC_SENTRY_DSN` di-prefix `NEXT_PUBLIC_` karena dibutuhkan di client-side. `SENTRY_AUTH_TOKEN` hanya untuk build process (tidak perlu di-expose ke client).

---

## Webhooks & Cron Secrets

> **Direkomendasikan.** Untuk keamanan endpoint yang dipanggil oleh cron jobs atau webhook eksternal.

### Generate Secrets

```bash
# Generate WEBHOOK_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CRON_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
WEBHOOK_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
CRON_SECRET="b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1"
```

### Cara Penggunaan

**WEBHOOK_SECRET** — Diverifikasi di endpoint `/api/webhooks/post-published`:
```bash
curl -X POST https://ai3.web.id/api/webhooks/post-published \
  -H "x-webhook-secret: your-secret-here" \
  -H "Content-Type: application/json" \
  -d '{"postSlug":"my-post","postTitle":"My Post","postUrl":"https://ai3.web.id/blog/my-post"}'
```

**CRON_SECRET** — Diverifikasi di endpoint `/api/posts/scheduled-publish` (jika tidak pakai Inngest):
```bash
# Panggil dari Vercel Cron atau service eksternal seperti cron-job.org
curl -X POST https://ai3.web.id/api/posts/scheduled-publish \
  -H "Authorization: Bearer your-cron-secret-here"
```

---

## Deployment ke Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
vercel login
```

### 2. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 3. Set Environment Variables di Vercel

**Via dashboard** (cara termudah):
1. Buka **https://vercel.com/dashboard** → pilih project
2. **Settings** → **Environment Variables**
3. Tambahkan semua variabel dari tabel checklist di bawah

**Via CLI** (untuk bulk setup):
```bash
# Tambahkan satu per satu
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... dst
```

### 4. Konfigurasi Domain Custom

1. **Settings** → **Domains** → **Add domain**
2. Masukkan `ai3.web.id`
3. Tambahkan DNS record yang diberikan Vercel di Cloudflare:
   - Type: `CNAME`, Name: `@`, Value: `cname.vercel-dns.com`

### 5. Sync Inngest setelah deploy

Setelah production URL aktif:
```bash
npx inngest-cli@latest sync --url https://ai3.web.id/api/inngest
```

---

## Environment Variables Checklist

Gunakan tabel ini untuk memastikan semua variabel sudah terisi sebelum deploy.

| Variabel | Wajib? | Deskripsi | Cara Mendapat |
|----------|--------|-----------|---------------|
| `NODE_ENV` | ✅ | Runtime mode | Set ke `production` di Vercel |
| `DATABASE_URL` | ✅ | PostgreSQL connection string | Neon Dashboard → Connection Details |
| `DIRECT_URL` | ✅ | Direct DB URL (untuk migrations) | Sama dengan DATABASE_URL (atau Neon unpooled) |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | App URL untuk auth callbacks | `https://ai3.web.id` di production |
| `ADMIN_EMAIL` | ✅ | Bootstrap admin email | Email admin kamu |
| `ADMIN_PASSWORD` | ✅ | Bootstrap admin password | Password kuat, ganti setelah setup |
| `AI_SETTINGS_ENCRYPTION_KEY` | ✅ | Encryption key untuk AI keys | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL | `https://ai3.web.id` |
| `OPENAI_API_KEY` | ⚡ (min 1) | OpenAI GPT access | platform.openai.com → API Keys |
| `ANTHROPIC_API_KEY` | ⚡ (min 1) | Claude access | console.anthropic.com → API Keys |
| `GOOGLE_AI_API_KEY` | ⚡ (min 1) | Gemini access | aistudio.google.com → Get API key |
| `GROQ_API_KEY` | ⚡ (min 1) | Groq LLaMA access | console.groq.com → API Keys |
| `R2_ACCOUNT_ID` | 🔵 Recommended | Cloudflare account ID | Cloudflare Dashboard → R2 |
| `R2_ACCESS_KEY_ID` | 🔵 Recommended | R2 access key | Cloudflare R2 → Manage API Tokens |
| `R2_SECRET_ACCESS_KEY` | 🔵 Recommended | R2 secret key | Cloudflare R2 → Manage API Tokens |
| `R2_BUCKET_NAME` | 🔵 Recommended | Nama R2 bucket | Nama bucket yang kamu buat |
| `RESEND_API_KEY` | 🔵 Recommended | Email sending | resend.com → API Keys |
| `INNGEST_EVENT_KEY` | 🔵 Recommended | Inngest event publishing | inngest.com → Event Keys |
| `INNGEST_SIGNING_KEY` | 🔵 Recommended | Inngest signature verification | inngest.com → Signing Keys |
| `UPSTASH_REDIS_REST_URL` | 🔵 Recommended | Redis REST URL | upstash.com → Database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | 🔵 Recommended | Redis REST token | upstash.com → Database → REST API |
| `NEXT_PUBLIC_SENTRY_DSN` | 🔵 Recommended | Sentry error tracking | sentry.io → Project → DSN |
| `SENTRY_AUTH_TOKEN` | 🔵 Recommended | Sentry source maps | sentry.io → Auth Tokens |
| `WEBHOOK_SECRET` | 🔵 Recommended | Webhook endpoint security | `openssl rand -hex 32` |
| `CRON_SECRET` | 🔵 Recommended | Cron endpoint security | `openssl rand -hex 32` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | ⬜ Optional | Google AdSense publisher ID | adsense.google.com → Account |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⬜ Optional | Google Analytics ID | analytics.google.com → Admin |
| `NEXT_PUBLIC_GSC_VERIFICATION` | ⬜ Optional | Search Console verification | search.google.com/search-console |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | ⬜ Optional | Umami analytics website ID | Self-hosted Umami dashboard |
| `NEXT_PUBLIC_UMAMI_URL` | ⬜ Optional | Umami instance URL | URL Umami instance kamu |

**Legend:**
- ✅ **Wajib** — App tidak akan jalan tanpa ini
- ⚡ **Min 1 wajib** — Setidaknya satu AI provider harus dikonfigurasi
- 🔵 **Recommended** — Fitur tertentu tidak aktif tanpa ini
- ⬜ **Optional** — Nice to have, tidak kritis

---

## Troubleshooting Umum

### ❌ `PrismaClientInitializationError`
- Pastikan `DATABASE_URL` valid dan database bisa diakses
- Jalankan `npx prisma generate` lagi setelah update schema

### ❌ Admin login redirect loop
- Pastikan `NEXTAUTH_SECRET` sudah di-set
- Pastikan `NEXTAUTH_URL` sesuai dengan domain yang diakses
- Di production, pastikan cookie name sesuai (`__Secure-authjs.session-token`)

### ❌ AI writer tidak muncul / error
- Pastikan minimal satu `*_API_KEY` sudah di-set
- Check admin Settings → AI Providers untuk konfigurasi provider aktif
- Periksa `AI_SETTINGS_ENCRYPTION_KEY` sudah di-set dengan benar

### ❌ Gambar tidak bisa diupload
- Pastikan semua 4 variabel R2 sudah diisi
- Pastikan bucket R2 sudah dibuat dan API token punya permission `Object Write`

### ❌ Email tidak terkirim
- Pastikan `RESEND_API_KEY` valid
- Pastikan domain di Resend sudah terverifikasi (cek DNS records)
- Cek Resend dashboard untuk log pengiriman

### ❌ Background jobs tidak berjalan
- Pastikan `INNGEST_EVENT_KEY` dan `INNGEST_SIGNING_KEY` sudah di-set
- Sync endpoint Inngest setelah deploy: Inngest Dashboard → Apps → Sync
- Periksa Inngest dashboard untuk function logs dan errors

---

## Mendapatkan Bantuan

- 📖 **Docs project:** `docs/` folder di repo ini
- 🐛 **Issue tracker:** https://github.com/abraham-yusuf/web3ai-hub/issues
- 📧 **Contact:** admin@ai3.web.id

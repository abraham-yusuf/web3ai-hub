# 🌐 Web3AI Hub — Platform Blog & Learning Web3 + AI

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Platform konten all-in-one untuk komunitas Web3 & AI Indonesia.**
Blog · Dokumentasi Interaktif · Airdrop Hub · AI Tools Directory

[Demo](#) · [Dokumentasi](#) · [Roadmap](./ROADMAP.md) · [Kontribusi](#contributing)

</div>

---

## ✨ Tentang Proyek

**Web3AI Hub** adalah platform konten modern yang dibangun dengan Next.js, dirancang khusus untuk berbagi pengetahuan seputar Web3 dan Artificial Intelligence. Platform ini menggabungkan blog berbasis MDX, dokumentasi interaktif ala GitBook, manajemen airdrop/bounty, dan direktori AI tools — semuanya terintegrasi dengan AI untuk membantu pembuatan konten otomatis dan pengalaman belajar yang personal.

Platform ini juga dirancang untuk **menghasilkan pendapatan** melalui Google AdSense, affiliate links, dan sponsored content.

---

## 🚀 Fitur Utama

### 📝 Blog (MDX-Powered + AI Writer)
- Tulis post dengan format Markdown / MDX yang kaya fitur
- **AI Auto-Writer** — generate draft artikel lengkap dengan satu klik
- Pilih provider AI sesuka hati: OpenAI, Claude, Gemini, Groq, atau Ollama (lokal)
- Kategorisasi, tagging, dan SEO otomatis
- Google AdSense terintegrasi dan dapat dikonfigurasi
- Syntax highlighting untuk kode dengan dukungan 100+ bahasa
- Estimated reading time, related posts, dan social sharing

### 📚 Learn / Tutorial (GitBook-style + AI Chat)
- Dokumentasi bertingkat dengan navigasi sidebar yang intuitif
- **AI Sidebar Chat** — tanya langsung tentang konten yang sedang dibaca
- Progress tracker per track pembelajaran
- Code playground terintegrasi
- Track tersedia: Web3 Fundamentals, Solidity, DeFi, NFT, AI Basics, LLM, AI Agents
- Dukungan AdSense di halaman dokumentasi

### 🪂 Airdrop Hub
- Listing airdrop aktif, akan datang, dan selesai
- Step-by-step tutorial dengan **checkbox progress interaktif**
- Filter berdasarkan network, estimasi reward, dan difficulty
- Estimasi nilai reward dalam USD
- Bounty board dan Testnet guide
- Status tracker real-time

### 🛠️ AI Tools Directory
- Direktori tool AI yang dapat dikelola sepenuhnya dari admin
- Kategori: Writing, Coding, Image, Video, Audio, Research, Web3, Productivity
- Rating dan review komunitas
- Fitur **Compare Tools** (maksimal 3 tool sekaligus)
- Halaman detail dengan pricing, alternatif, dan affiliate link
- Submit tool baru oleh komunitas

### ⚙️ Admin Dashboard
- Manajemen post: create, edit, delete, schedule publish
- **AI Settings**: pilih provider, atur API key, model, temperature, system prompt
- Konfigurasi AdSense per halaman/section
- Manajemen airdrop dan AI tools
- Analytics dashboard (page views, engagement, revenue estimate)
- Media library untuk upload gambar

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Content** | MDX + gray-matter + next-mdx-remote |
| **AI Integration** | Vercel AI SDK (multi-provider) |
| **Database** | PostgreSQL (Neon) + Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **Animation** | Framer Motion |
| **State** | Zustand + TanStack Query |
| **Search** | Algolia / Fuse.js (local) |
| **Deploy** | Vercel Edge Network |
| **Storage** | Cloudflare R2 |
| **Analytics** | Umami (self-hosted) |

---

## 🤖 AI Provider yang Didukung

```
✅ OpenAI        — GPT-4o, GPT-4 Turbo, GPT-3.5
✅ Anthropic     — Claude 3.5 Sonnet, Claude 3 Opus
✅ Google        — Gemini 1.5 Pro, Gemini Flash
✅ Groq          — Llama 3, Mixtral (fallback cepat)
```

---

## 📁 Struktur Project

```
web3ai-hub/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Route group publik
│   │   ├── blog/                 # Blog listing & detail
│   │   ├── learn/                # Dokumentasi & tutorial
│   │   ├── airdrop/              # Airdrop hub
│   │   └── ai-tools/             # AI tools directory
│   ├── admin/                    # Dashboard admin (protected)
│   │   ├── posts/
│   │   ├── learn/
│   │   ├── airdrop/
│   │   ├── tools/
│   │   └── settings/             # AI & AdSense config
│   └── api/                      # API routes
│       ├── ai/
│       │   ├── generate/         # AI content generation
│       │   └── chat/             # AI Q&A chat
│       └── revalidate/           # ISR revalidation
│
├── content/                      # Konten MDX (flat files)
│   ├── blog/                     # Post blog (.mdx)
│   ├── learn/
│   │   ├── web3/                 # Track Web3
│   │   └── ai/                   # Track AI
│   └── airdrop/                  # Panduan airdrop (.mdx)
│
├── components/                   # React components
│   ├── blog/
│   ├── learn/
│   │   └── AiSidebar.tsx
│   ├── airdrop/
│   │   └── StepTracker.tsx
│   ├── tools/
│   ├── admin/
│   ├── adsense/
│   │   └── AdSlot.tsx
│   └── ui/                       # shadcn/ui components
│
├── lib/                          # Utilities & helpers
│   ├── ai/
│   │   ├── providers.ts          # Multi-provider abstraction
│   │   └── prompts.ts            # System prompts
│   ├── mdx/
│   │   ├── parser.ts
│   │   └── plugins.ts
│   ├── db/
│   │   └── prisma.ts
│   └── utils/
│
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand stores
├── types/                        # TypeScript types
├── prisma/
│   └── schema.prisma
├── public/
└── styles/
```

---

## 🚀 Quick Start

### Prasyarat
- Node.js 18+
- PostgreSQL (atau akun Neon gratis)
- API Key AI provider (minimal salah satu)

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/abraham-yusuf/web3ai-hub.git
cd web3ai-hub

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan konfigurasi kamu

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Seed data awal (opsional)
npm run db:seed

# 6. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI Providers (isi minimal satu)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""
GROQ_API_KEY=""

# Google AdSense
AI_SETTINGS_ENCRYPTION_KEY="<base64-32-byte-key>"

NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-XXXXXXXXXX"

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""

# Analytics (Umami)
NEXT_PUBLIC_UMAMI_WEBSITE_ID=""
NEXT_PUBLIC_UMAMI_URL=""
```

---


## 🧭 Environment Modes

Aplikasi mendukung tiga mode runtime:

| Mode | Tujuan | Catatan |
|------|--------|---------|
| `development` | Pengembangan lokal | Wajib set `DATABASE_URL` dan `NEXTAUTH_SECRET`. |
| `staging` | Preview/UAT sebelum production | Gunakan service eksternal yang sama seperti production untuk validasi integrasi. |
| `production` | Environment live pengguna akhir | Semua secret harus diisi melalui platform deploy (mis. Vercel env). |

> Salin `.env.example` ke `.env.local` untuk development lokal.

## 🔐 Role Matrix (Baseline)

| Role | Akses Admin Route | Keterangan |
|------|-------------------|------------|
| `ADMIN` | ✅ Ya | Akses penuh dashboard admin. |
| `EDITOR` | ✅ Ya | Akses operasional konten. |
| `VIEWER` | ❌ Tidak | Tidak bisa masuk area admin. |

## 💰 Strategi Monetisasi

| Sumber | Deskripsi | Estimasi |
|--------|-----------|----------|
| **Google AdSense** | Auto-placed ads di blog, docs, tools | Variabel |
| **Affiliate Links** | Referral ke exchange, wallet, tools | 5-30% komisi |
| **Sponsored Listing** | Airdrop/tool berbayar masuk listing | Flat fee |
| **Premium Content** | Akses eksklusif ke konten advanced | Subscription |

---

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Linting
npm run typecheck    # TypeScript check (quality gate)
npm run test         # Node.js test runner
npm run setup-hooks  # Aktifkan pre-commit hook lokal
npm run db:push      # Push schema ke database
npm run db:seed      # Seed data awal
npm run db:studio    # Buka Prisma Studio
npm run content:new  # Buat post baru via CLI
```

---

## 🤝 Contributing

Kontribusi sangat disambut! Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan lengkap.

1. Fork repo ini
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 📄 License

MIT License — lihat [LICENSE](./LICENSE) untuk detail.

---

<div align="center">
Dibuat dengan ❤️ untuk komunitas Web3 & AI Indonesia
</div>

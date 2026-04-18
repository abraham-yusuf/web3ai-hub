# 🗺️ ROADMAP — Web3AI Hub

> Roadmap ini mengikuti pendekatan iteratif: setiap fase menghasilkan versi yang *shippable* dan dapat menghasilkan traffic/revenue.

---

## Status Legend

| Status | Simbol |
|--------|--------|
| Selesai | ✅ |
| Sedang berjalan | 🔄 |
| Direncanakan | 📋 |
| Ide / Backlog | 💡 |
| Ditunda | ⏸️ |

---

## Phase 0 — Foundation (Minggu 1–2)
> **Goal:** Project siap development, semua alat dan struktur terpasang.

### Setup & Scaffolding
- 📋 Init Next.js project (App Router + TypeScript + Tailwind)
- 📋 Setup shadcn/ui component library
- 📋 Konfigurasi ESLint, Prettier, Husky pre-commit hooks
- 📋 Setup Prisma + Neon PostgreSQL (schema awal)
- 📋 Setup NextAuth.js (email/password untuk admin)
- 📋 Struktur folder sesuai arsitektur di README
- 📋 Environment variables template (`.env.example`)
- 📋 Deploy ke Vercel (preview environment)
- 📋 Setup Cloudflare DNS dan domain custom

### Design System
- 📋 Definisi color tokens di `tailwind.config.ts`
- 📋 Typography scale
- 📋 Dark/light mode toggle dengan `next-themes`
- 📋 Base layout components: Navbar, Footer, Sidebar
- 📋 Komponen UI dasar: Button, Badge, Card, Input, Modal

---

## Phase 1 — Blog Core (Minggu 3–5)
> **Goal:** Platform blog fungsional dengan MDX dan bisa dipublish ke Vercel.

### Blog Reader Experience
- 📋 MDX parsing pipeline (`next-mdx-remote` + `gray-matter`)
- 📋 Halaman listing blog dengan grid card
- 📋 Halaman detail post (MDX render)
- 📋 Syntax highlighting dengan Shiki
- 📋 Custom MDX components: Callout, CodeBlock, ImageCaption
- 📋 Table of contents (floating sidebar)
- 📋 Reading time estimator
- 📋 Related posts section
- 📋 Social share buttons (Twitter/X, Telegram, Copy Link)
- 📋 OG image generation dinamis (`@vercel/og`)
- 📋 JSON-LD structured data (Article schema)
- 📋 Sitemap.xml dinamis
- 📋 robots.txt

### Blog Admin
- 📋 Admin layout dengan protected routes (NextAuth middleware)
- 📋 Admin: list semua posts (title, status, date, views)
- 📋 Admin: create/edit post dengan form + MDX preview
- 📋 Admin: delete post dengan konfirmasi
- 📋 Admin: toggle draft/published status
- 📋 Admin: schedule publish

### Categories & Tags
- 📋 Database: Category dan Tag models
- 📋 Filter listing blog by category
- 📋 Filter listing blog by tag
- 📋 Halaman `/blog/category/[slug]`
- 📋 Halaman `/blog/tag/[slug]`

**Deliverable Phase 1:** Blog berfungsi penuh, bisa publish artikel MDX, admin bisa kelola post. 🎉

---

## Phase 2 — AI Writer (Minggu 6–7)
> **Goal:** Admin bisa generate draft artikel otomatis dengan berbagai AI provider.

### AI Provider Abstraction
- 📋 Setup Vercel AI SDK
- 📋 Provider abstraction layer (`lib/ai/providers.ts`)
- 📋 Support: OpenAI (GPT-4o, GPT-3.5), Anthropic (Claude), Google (Gemini), Groq
- 📋 Fallback otomatis jika provider gagal

### AI Writer UI
- 📋 Form AI Writer di admin (topic, tone, length, language, provider, model)
- 📋 Streaming output dengan real-time display
- 📋 Template prompts: Tutorial, Opinion, News Summary, Tool Review, Airdrop Guide
- 📋 Tombol: Copy, Insert ke Editor, Regenerate
- 📋 Token usage estimator

### AI Settings Admin
- 📋 Halaman `/admin/settings` — konfigurasi AI
- 📋 Input API key per provider (encrypted storage)
- 📋 Pilih model per provider
- 📋 Temperature slider
- 📋 Custom system prompt per use case
- 📋 Default provider setting per fitur
- 📋 Test connection button

**Deliverable Phase 2:** AI writer terintegrasi, admin bisa generate artikel dengan satu klik. 🤖

---

## Phase 3 — AdSense & Monetisasi (Minggu 8)
> **Goal:** Platform mulai menghasilkan revenue dari hari pertama traffic masuk.

### Google AdSense Integration
- 📋 Komponen `AdSlot.tsx` yang reusable
- 📋 Auto-ads script di `_document` atau layout
- 📋 Manual ad placement:
  - Blog: setelah paragraf ke-3, dan sebelum related posts
  - Blog sidebar: sticky ad
  - Footer: responsive ad
- 📋 Admin: konfigurasi Publisher ID dan slot IDs
- 📋 Admin: toggle on/off ads per section
- 📋 Conditional: tidak tampilkan ads untuk admin logged in

### SEO Optimization
- 📋 Audit dan fix semua meta tags
- 📋 Canonical URLs
- 📋 Image alt texts
- 📋 Internal linking strategy
- 📋 Core Web Vitals audit dan fix

**Deliverable Phase 3:** AdSense aktif, revenue stream pertama berjalan. 💰

---

## Phase 4 — Learn Module (Minggu 9–11)
> **Goal:** Dokumentasi interaktif ala GitBook dengan AI chat sidebar.

### Dokumentasi Structure
- 📋 Database: LearningTrack, LearningSection, LearningPage models
- 📋 Sidebar navigasi bertingkat dengan accordion
- 📋 MDX render untuk halaman dokumentasi
- 📋 Breadcrumb navigation
- 📋 Previous / Next page navigation
- 📋 Mini table of contents per halaman

### Konten Awal
- 📋 Track Web3: 5 sections, 20+ halaman
  - Blockchain Basics (5 halaman)
  - Ethereum & Smart Contracts (5 halaman)
  - DeFi Fundamentals (5 halaman)
  - NFT & Digital Ownership (3 halaman)
  - DAO & Governance (3 halaman)
- 📋 Track AI: 5 sections, 20+ halaman
  - AI Fundamentals (4 halaman)
  - Prompt Engineering (5 halaman)
  - LLM APIs & Integration (5 halaman)
  - AI Agents (4 halaman)
  - Fine-tuning Basics (3 halaman)

### AI Chat Sidebar
- 📋 Sliding panel (collapsible)
- 📋 Context injection: konten halaman aktif sebagai system context
- 📋 Chat interface dengan streaming response
- 📋 Suggested questions auto-generated dari konten halaman
- 📋 Session history di localStorage

### Progress Tracker
- 📋 Mark page as complete (guest: localStorage, user: database)
- 📋 Progress bar per section dan per track
- 📋 User profile: dashboard progress semua track
- 📋 "Continue learning" CTA di homepage

### Learn Admin
- 📋 CRUD tracks, sections, pages
- 📋 Drag-and-drop reorder sections dan pages
- 📋 MDX editor dengan preview

**Deliverable Phase 4:** Platform dokumentasi interaktif dengan AI chat. 📚

---

## Phase 5 — Airdrop Hub (Minggu 12–14)
> **Goal:** Direktori airdrop terlengkap dengan step tracker interaktif.

### Airdrop Listing
- 📋 Database: Airdrop, AirdropStep, AirdropRequirement models
- 📋 Listing page dengan grid cards
- 📋 Filter: status (Active/Upcoming/Ended), network, difficulty, reward range
- 📋 Sort: reward, deadline, newest
- 📋 Search by nama project
- 📋 Status badge dengan warna: Active (hijau), Upcoming (kuning), Ended (abu)

### Detail Airdrop
- 📋 Hero section: logo, nama, deskripsi, network badge, estimated reward
- 📋 MDX tutorial steps render
- 📋 **Interactive Step Tracker:**
  - Checkbox per langkah
  - Progress bar keseluruhan
  - State tersimpan di localStorage (guest) / database (user)
  - Tombol "Reset Progress"
- 📋 Requirements list (wallet, tools, minimum balance)
- 📋 Social links
- 📋 "Report Issue" button
- 📋 Related airdrops

### Airdrop Admin
- 📋 CRUD airdrop listings
- 📋 AI Generate Tutorial dari nama project
- 📋 Status management (Active/Upcoming/Ended)
- 📋 Bulk update status

### Bounty Board (P2)
- 📋 Listing bounty dengan filter skill
- 📋 Link ke bounty program resmi

**Deliverable Phase 5:** Airdrop Hub lengkap, siap jadi referensi utama airdrop Indonesia. 🪂

---

## Phase 6 — AI Tools Directory (Minggu 15–17)
> **Goal:** Direktori AI tools terkurasi dengan fitur compare.

### Tools Listing
- 📋 Database: AiTool, ToolCategory, ToolReview models
- 📋 Grid listing dengan filter dan search
- 📋 Kategori: Writing, Coding, Image, Video, Audio, Research, Web3, Productivity
- 📋 Pricing filter: Free, Freemium, Paid
- 📋 Featured tools section (configurable dari admin)
- 📋 "New this week" badge

### Detail Tool
- 📋 Header: logo, nama, tagline, website link (affiliate), pricing, rating
- 📋 MDX description
- 📋 Key features list
- 📋 Pros & cons
- 📋 Alternatives grid
- 📋 Screenshots / video embed
- 📋 Affiliate link tracking

### Compare Feature
- 📋 "Add to compare" button di setiap tool card
- 📋 Floating compare bar (persistent, max 3 tools)
- 📋 Halaman compare: tabel fitur side-by-side
- 📋 Shareable compare URL

### Tools Admin
- 📋 CRUD tool listings
- 📋 Upload logo dan screenshots (Cloudflare R2)
- 📋 Set affiliate URL
- 📋 Toggle featured
- 📋 AI Generate description dari nama tool + website

### Data Seeding Awal
- 📋 100 AI tools di semua kategori
- 📋 Data: nama, deskripsi, link, pricing, kategori, logo

**Deliverable Phase 6:** AI Tools directory lengkap dengan 100+ tools. 🛠️

---

## Phase 7 — Polish & Launch (Minggu 18–20)
> **Goal:** Platform siap untuk publik, semua edge case tertangani.

### Performance
- 📋 Bundle size audit dan optimization
- 📋 Image optimization audit
- 📋 Cache strategy review (ISR revalidation times)
- 📋 Database query optimization (N+1 check)
- 📋 Lighthouse audit: target ≥ 90 semua metrik

### Search
- 📋 Global search (blog + learn + airdrop + tools)
- 📋 Fuse.js untuk local search (tanpa biaya)
- 📋 Search results page dengan filter per konten type

### User Experience
- 📋 Loading states dan skeleton screens di semua halaman
- 📋 Error boundaries dan 404/500 pages yang baik
- 📋 Onboarding toast untuk visitor pertama
- 📋 Newsletter CTA (Resend integration)
- 📋 Cookie consent banner (GDPR)

### Analytics
- 📋 Umami self-hosted setup
- 📋 Custom events: AI writer usage, tool clicks, airdrop step completion
- 📋 Admin analytics dashboard

### Testing
- 📋 Unit tests untuk utility functions
- 📋 Integration tests untuk API routes
- 📋 E2E test untuk user journeys kritis (Playwright)
- 📋 Manual QA di mobile dan desktop

### Launch Preparation
- 📋 Content: minimal 20 blog posts, 15 airdrop guides, 100 AI tools
- 📋 Submit ke Google Search Console
- 📋 Setup Google Analytics 4
- 📋 Social media accounts (Twitter/X, Telegram channel)
- 📋 Launch announcement post

**Deliverable Phase 7:** 🚀 PLATFORM LAUNCH!

---

## Phase 8+ — Post-Launch (Bulan 2–3)
> **Goal:** Tumbuhkan traffic dan revenue berdasarkan data.

### Community Features (v2.0)
- 💡 Sistem komentar (Giscus — GitHub Discussions based)
- 💡 User accounts (bukan hanya admin)
- 💡 Bookmark post / airdrop / tools
- 💡 Community submit: airdrop listing + moderation queue
- 💡 Leaderboard progress belajar

### Monetisasi Lanjutan
- 💡 Premium subscription (akses konten eksklusif, no-ads)
- 💡 Sponsored airdrop listings (paid featured)
- 💡 Kursus berbayar (video + MDX)
- 💡 Newsletter premium (Resend)

### Content Automation
- 💡 Auto-detect trending AI tools dari Twitter/X dan Product Hunt
- 💡 Scheduled AI content generation (weekly roundup otomatis)
- 💡 Airdrop deadline reminder via email/Telegram bot
- 💡 Auto-update airdrop status via API (DeBank, etc.)

### Platform Expansion
- 💡 API publik untuk data airdrop dan AI tools
- 💡 Telegram bot: notifikasi airdrop baru
- 💡 Multi-author support
- 💡 Widget embed untuk airdrop tracker

---

## Timeline Overview

```
Minggu  1-2  │ Phase 0 │ Foundation & Setup
Minggu  3-5  │ Phase 1 │ Blog Core
Minggu  6-7  │ Phase 2 │ AI Writer
Minggu    8  │ Phase 3 │ AdSense & SEO
Minggu 9-11  │ Phase 4 │ Learn Module
Minggu 12-14 │ Phase 5 │ Airdrop Hub
Minggu 15-17 │ Phase 6 │ AI Tools Directory
Minggu 18-20 │ Phase 7 │ Polish & Launch
Bulan  2-3+  │ Phase 8 │ Post-Launch Growth
```

---

## Prioritas Fitur (MoSCoW)

### Must Have (v1.0)
- Blog dengan MDX
- AI Writer (multi-provider)
- Google AdSense
- Airdrop Hub dengan Step Tracker
- AI Tools Directory
- Admin Dashboard
- SEO & Performance

### Should Have (v1.0)
- Learn/Docs module dengan AI chat
- Progress tracker
- Global search
- Dark mode
- Compare tools

### Could Have (v1.1)
- Komentar (Giscus)
- User registration
- Bookmark
- Newsletter integration
- Analytics dashboard

### Won't Have (v1.0)
- Forum diskusi
- Mobile app
- Wallet connect
- Live crypto price

---

*Roadmap ini adalah dokumen hidup. Prioritas dapat berubah berdasarkan feedback pengguna dan kondisi pasar.*

# 🚀 AI3 / Web3AI Hub — Active TODO

> Hanya item yang **belum selesai**. Untuk riwayat sprint 1–10, lihat [CHANGELOG.md](./CHANGELOG.md).
> Terakhir diupdate: 2026-06-14 | **Sprint 12: Admin Fix + Content Audit**

---

## 📊 Progress Overview

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 0 — Foundation | ✅ Complete | 100% |
| Phase 1 — Branding & Visual | ✅ Complete | 100% |
| Phase 2 — AI-First Experience | ✅ Complete | 100% |
| Phase 3 — Content Engine | 🔄 ~98% | Missing: plagiarism checker only |
| Phase 4 — Airdrop Ecosystem | ✅ Complete | 100% (Airdrop Hub + Gamification) |
| Phase 5 — Tools Ecosystem | ✅ Complete | 100% (AI Tools Directory + Web3 Tools pending) |
| Phase 6 — Platform Engineering | ⏳ Not started | Performance, security, infra |
| Phase 7 — Growth & Monetization | ⏳ Not started | Growth + revenue |
| Phase 8 — Community & Ecosystem | ⏳ Not started | Community features |
| Long-Term Vision | ⏳ Future | AI3 platform evolution |

---

## 🔴 HIGH PRIORITY — Sebelum Launch

### 🛡️ Security Hardening (Phase 6)

> Platform punya admin panel + AI API routes — ini kritis sebelum production.

- [x] Rate limiting pada AI routes (`/api/research/assistant`, `/api/learn/chat`, `/api/content/translate`, `/api/admin/learn/*/generate`) — strict 8/min (admin) + normal 30/min (public), shared `rate-limiter.ts`
- [x] CSRF protection untuk admin POST/PUT/DELETE routes — via `proxy.ts` with method check
- [x] Security headers (helmet) — Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security
- [x] API abuse prevention (request throttling, input validation) — rate limiter integrated
- [x] Audit logging untuk admin actions — integrated ke posts, airdrops, tools, faq, glossary actions, `AdminActivity` model di DB
- [x] Admin activity tracking — `AdminActivity` table dengan actor, resource, action, metadata, indexed untuk dashboard

### ⚡ Performance Audit (Phase 6)

> Target Lighthouse 90+ semua metrik.

- [ ] Lighthouse baseline audit (desktop + mobile)
- [ ] JS bundle size audit & optimization
- [ ] Image optimization audit (next/image, WebP/AVIF)
- [ ] Core Web Vitals measurement & fix
- [ ] Database query optimization — cek N+1 queries (Prisma `tracing`)
- [ ] Edge caching strategy (ISR revalidation times review)
- [ ] Lazy loading improvements

### 🧪 Testing (Phase 6)

> Roadmap target unit + integration + E2E, saat ini hanya test dasar.

- [ ] Unit tests: `lib/ai/providers.ts` (fallback logic, model selection)
- [ ] Unit tests: utility functions (`lib/utils/`, `lib/mdx/`)
- [ ] Integration tests: API routes (`/api/ai/generate`, `/api/ai/chat`, `/api/airdrop/*`)
- [ ] Integration tests: Prisma CRUD operations
- [ ] E2E tests: critical user journeys (Playwright)
  - Blog listing → detail → share
  - Airdrop listing → detail → step tracker
  - AI Tools search → compare
  - Admin login → create post → publish

### 📚 Content Expansion

> Blog cuma 3 post, learn content minimal. Traffic = konten.

- [x] Blog: generate 20+ posts minimal — 60+ MDX posts exist across 4 categories (web3-fundamentals, ai-tutorials, airdrop-guides, opinion-news) × ID+EN
  - 5x Web3 fundamentals (blockchain basics, DeFi intro, NFT guide, wallet setup, gas fees)
  - 5x AI tutorials (prompt engineering, LLM comparison, AI tools review, ChatGPT tips, AI image generation)
  - 5x Airdrop guides (current active airdrops, how to qualify, scam avoidance)
  - 5x Opinion/News (Web3 trends, AI regulation, market analysis)
- [x] Learn: expand Web3 track ke 20+ halaman — 30 pages in content/learn/web3-basics/ (Solidity, DeFi, DAO, NFT, AMM, etc.)
- [x] Learn: expand AI track ke 20+ halaman — 32 pages in content/learn/ai-basics/ (LLM integration, fine-tuning, RAG Production, AI Agents, etc.)

### 📄 Content Workflow Gap (Phase 3)

- [x] AI plagiarism checker — /api/admin/posts/plagiarism-check, Jaccard trigram similarity against all published posts, threshold 30%, returns top 5 matches

---

## 🟠 MEDIUM PRIORITY — Pasca Launch

### 🎮 Gamification (Phase 4)

> Penting untuk retention di platform learning.

- [x] User profiles (bio, avatar, social links, learning stats) — `/profile/[username]` public page
- [x] Achievement badges (complete track, first post, streak milestones) — `/achievements` gallery + `/admin/achievements`
- [x] Learning XP system (XP per lesson/quiz, level progression) — `src/lib/gamification.ts` with xpToLevel formula
- [x] Referral system (invite link, bonus XP) — `/api/gamification/referral`, 50 XP both parties
- [x] Community leaderboard (weekly/monthly) — `/leaderboard` top 50 + podium
- [x] Daily streak system (consecutive day tracking, streak rewards) — `/api/gamification/streak` + StreakWidget

### 🛠️ AI Tools Directory (Phase 5)

- [x] Advanced filtering (by features, integrations, languages, pricing type, platform) — multi-select filter chips, dynamic Prisma query
- [x] AI recommendation engine — trending API (`/api/tools/trending`) based on viewCount + bookmarks + rating
- [x] User ratings & reviews system — `ToolReview` model, `/api/tools/[slug]/reviews`, `ReviewsSection` component
- [x] Bookmark/save tools — `ToolBookmark` model, `/api/tools/bookmarks`, `BookmarkButton` component
- [x] Compare unlimited tools (upgrade dari max 3) — unlimited compare, max 20
- [x] AI tool collections/curated lists — `ToolCollection` model, `/collections`, `/admin/collections`, 5 seeded collections
- [x] Trending tools system (based on views/clicks/ratings) — `viewCount` field, `/api/tools/[slug]/view` tracker, trending sort
- [x] Sponsored tools system (paid placement) — `sponsored` field on AITool, sponsored badge + float-to-top in results

### 🌐 Web3 Tools (Phase 5)

- [ ] Wallet tracker (portfolio overview, PnL)
- [ ] Gas fee tracker (real-time, multi-chain)
- [ ] NFT analyzer (collection stats, floor price)
- [ ] Portfolio dashboard (multi-chain aggregation)
- [ ] DeFi analytics (TVL, APY, impermanent loss)
- [ ] Smart contract verifier (source code verification)

### 📈 Growth System (Phase 7)

- [ ] Email newsletter (Resend integration, subscribe form, digest)
- [ ] Push notifications (browser push for new content)
- [ ] User onboarding flow (welcome tour, preference selection)
- [ ] Referral program (shareable links, incentive tracking)
- [ ] Discord integration (bot, community sync)
- [ ] Twitter/X auto-posting (new blog post announcements)
- [ ] Telegram integration (notifications, airdrop alerts)

### 💰 Monetization (Phase 7)

- [ ] Premium memberships (subscription tiers, payment integration)
- [ ] Premium AI features (advanced models, unlimited generation)
- [ ] Paid learning tracks (certification, premium content)
- [ ] Sponsored content (native ads, sponsored posts)
- [ ] Sponsored airdrops (paid featured placement)
- [ ] Sponsored AI tools (promoted listings)
- [ ] Affiliate optimization (A/B testing, conversion tracking)
- [ ] Subscription analytics (MRR, churn, LTV)

---

## 🟢 LOW PRIORITY — Future

### 🌍 Community & Ecosystem (Phase 8)

- [ ] User-generated content (community posts, tutorials)
- [ ] Contributor system (open content creation, moderation)
- [ ] Public author profiles (SEO-friendly author pages)
- [ ] Reputation system (karma, badges, trust scores)
- [ ] Community moderation (report, review, approve)
- [ ] Public roadmap voting (community feature requests)
- [ ] API for developers (public REST/GraphQL API)
- [ ] Plugin system (third-party extensions)
- [ ] Public SDK (JavaScript/Python client library)
- [ ] Third-party integrations (Notion, Obsidian, etc.)

### 🏗️ Infrastructure (Phase 6)

- [ ] Queue system (BullMQ / Inngest for async jobs)
- [ ] Background jobs (scheduled content, airdrop updates)
- [ ] Webhook system (external event handling)
- [ ] Redis caching (API response caching, session store)
- [ ] AI response caching (avoid duplicate generations)
- [ ] CDN optimization (static assets, edge delivery)
- [ ] Monitoring dashboard (uptime, performance, errors)
- [ ] Error tracking (Sentry integration)
- [ ] Backup system (database backups, content snapshots)
- [ ] Secrets encryption (comprehensive key management)

### 🚀 Long-Term Vision

- [ ] AI-native Web3 university (structured degree programs)
- [ ] Autonomous AI learning agents (personal tutors)
- [ ] Personalized AI learning paths (adaptive curriculum)
- [ ] AI crypto portfolio assistant (investment guidance)
- [ ] AI-powered research terminal (deep analysis tools)
- [ ] Decentralized AI infrastructure (on-chain compute)
- [ ] Multi-agent AI workflows (agent orchestration)
- [ ] AI creator economy tools (content monetization)

---

## 🎯 NORTH STAR

> Build the leading AI-native Web3 learning & research platform in Indonesia and Southeast Asia.

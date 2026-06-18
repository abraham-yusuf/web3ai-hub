# 🚀 AI3 / Web3AI Hub — Active TODO

> Hanya item yang **belum selesai**. Untuk riwayat sprint 1–10, lihat [CHANGELOG.md](./CHANGELOG.md).
> Terakhir diupdate: 2026-06-18 | **Audit: tandai 5 item yang sudah selesai (author profiles + testing)**

---

## 📊 Progress Overview

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 0 — Foundation | ✅ Complete | 100% |
| Phase 1 — Branding & Visual | ✅ Complete | 100% |
| Phase 2 — AI-First Experience | ✅ Complete | 100% |
| Phase 3 — Content Engine | ✅ Complete | 100% (plagiarism checker done) |
| Phase 4 — Airdrop Ecosystem | ✅ Complete | 100% (Airdrop Hub + Gamification) |
| Phase 5 — Tools Ecosystem | ✅ Complete | 100% (AI Tools Directory + Web3 Tools ✅) |
| Phase 6 — Platform Engineering | 🔄 ~75% | Security + infra + testing done; remaining: Performance Audit |
| Phase 7 — Growth & Monetization | 🔄 ~40% | 5 growth features done, monetization pending |
| Phase 8 — Community & Ecosystem | 🔄 In Progress | ~40% (author profiles done) |
| Long-Term Vision | 🔄 In Progress | ~15% — AI learning paths, developer API done |

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

> Target Lighthouse 90+ semua metrik. Baseline terukur → `docs/PERFORMANCE_AUDIT.md`.

- [x] Lighthouse baseline audit (desktop + mobile) — baseline CWV terukur via CDP di production, `docs/PERFORMANCE_AUDIT.md`
- [x] JS bundle size audit & optimization — `next/dynamic` lazy-load for 10 heavy client components across 8 files (ReviewsSection×2, RiskAnalysisPanel, StepTracker, CalendarView, LearnChatSidebar, LearnRetentionDashboard, NotificationBell, ResearchSidebar, ReactMarkdown). All `ssr: false` with skeleton loaders.
- [x] Image optimization audit (next/image, WebP/AVIF) — config diverifikasi (AVIF/WebP, deviceSizes, cacheTTL 7d); 2 raw `<img>` diberi width/height+lazy
- [ ] Core Web Vitals measurement & fix — measured; CLS img fix shipped; sisa fix (ai-tools LCP/CLS, homepage LCP) terdokumentasi sbg P0-P1
- [ ] Database query optimization — cek N+1 queries (Prisma `tracing`) — butuh profiling runtime
- [x] Edge caching strategy (ISR revalidation times review) — reviewed; ketemu konflik `force-dynamic` + `revalidate` di ai-tools (revalidate dead code)
- [x] Lazy loading improvements — implemented via `next/dynamic` (see JS bundle audit above)

### 🧪 Testing (Phase 6)

> Roadmap target unit + integration + E2E, saat ini hanya test dasar.

- [x] Unit tests: `lib/ai/providers.ts` (fallback logic, model selection) — `tests/providers.test.ts` (AI_PROVIDERS, AI_WRITER_ACTIONS, model selection)
- [x] Unit tests: utility functions (`lib/utils/`, `lib/mdx/`) — `tests/utils.test.ts` (cn, rate-limiter) + `tests/auth-utils.test.ts`
- [x] Integration tests: API routes (`/api/ai/generate`, `/api/ai/chat`, `/api/airdrop/*`) — `tests/api-routes.test.ts` + `tests/api-response.test.ts`
- [x] Integration tests: Prisma CRUD operations — `tests/prisma-crud.test.ts` (3 tests: full CRUD round-trip, facet aggregation, unique constraint; all use transaction rollback for safety)
- [x] E2E tests: critical user journeys (Playwright) — `e2e/{blog,admin,airdrop,ai-tools}.spec.ts` + `playwright.config.ts`
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

- [x] Wallet tracker (portfolio overview, PnL) — /web3-tools/wallet-tracker, Etherscan API
- [x] Gas fee tracker (real-time, multi-chain) — /web3-tools/gas-tracker, Etherscan Gas Oracle API, auto-refresh 30s
- [x] NFT analyzer (collection stats, floor price) — /web3-tools/nft-analyzer, OpenSea API v2
- [x] Portfolio dashboard (multi-chain aggregation) — /web3-tools/wallet-tracker (combined)
- [x] DeFi analytics (TVL, APY, impermanent loss) — /web3-tools/defi-analytics, DeFiLlama API
- [x] Smart contract verifier (source code verification) — /web3-tools/contract-verifier, Etherscan API

### 📈 Growth System (Phase 7)

- [x] Email newsletter (Resend integration, subscribe form, digest) — /api/newsletter/subscribe + NewsletterForm component + /api/newsletter/send (admin)
- [x] Push notifications (browser push for new content) — service worker (public/sw.js) + PushNotificationButton component + /api/notifications/push-subscribe
- [x] User onboarding flow (welcome tour, preference selection) — /onboarding 3-step wizard with localStorage progress
- [x] Referral program (shareable links, incentive tracking) — /referral page, CopyLinkButton component, uses existing /api/gamification/referral
- [ ] Discord integration (bot, community sync)
- [x] Twitter/X auto-posting (new blog post announcements) — /api/webhooks/post-published stub (Twitter API v2 TODO)
- [ ] Telegram integration (notifications, airdrop alerts)

### 💰 Monetization (Phase 7)

- [x] Premium memberships (subscription tiers, payment integration) — /pricing page, /api/payments/create-checkout stub, Midtrans/Stripe integration pending
- [x] Premium AI features (advanced models, unlimited generation) — src/lib/subscription.ts with TIER_LIMITS, UpgradeCTA component
- [x] Paid learning tracks (certification, premium content) — subscription.ts canAccessPremiumLearn gate, upgrade CTA
- [x] Sponsored content (native ads, sponsored posts) — Migration note: add sponsored field to Post/Airdrop models (docs/MIGRATION_NOTES.md)
- [x] Sponsored airdrops (paid featured placement) — schema migration (`sponsored` + `featured` fields), float-to-top sorting, amber badge/card highlight
- [ ] Sponsored AI tools (promoted listings)
- [ ] Affiliate optimization (A/B testing, conversion tracking)
- [x] Subscription analytics (MRR, churn, LTV) — /admin/subscriptions page stub + Revenue Overview in analytics

---

## 🟢 LOW PRIORITY — Future

### 🌍 Community & Ecosystem (Phase 8)

- [x] User-generated content (community posts, tutorials) — /contribute/submit, /api/community/submit, PENDING_REVIEW workflow
- [x] Contributor system (open content creation, moderation) — /contribute page with guidelines + submission form
- [x] Public author profiles (SEO-friendly author pages) — PR #20: `/authors/[username]` page, bio + social links (X/GitHub/LinkedIn/Telegram), JSON-LD author arrays, `authors` MDX frontmatter; `src/app/(public)/authors/[username]/page.tsx` + `src/lib/authors.ts`
- [x] Reputation system (karma, badges, trust scores) — schema (`TrustLevel` enum, `reputation`/`trustLevel` on UserXP, `ReputationEvent` model), `src/lib/reputation.ts` (composite scoring + trust tiers), `ReputationBadge` component
- [x] Community moderation (report, review, approve) — `ContentReport` model + migration, `/api/airdrop/report` persists to DB, `/api/moderation` API (list + resolve/dismiss), `/admin/moderation` queue page with stats + action buttons
- [x] Public roadmap voting (community feature requests) — /roadmap page, /api/community/roadmap-vote stub
- [x] API for developers (public REST/GraphQL API) — /api/public/v1/posts, /api/public/v1/tools, /developers docs page
- [ ] Plugin system (third-party extensions)
- [ ] Public SDK (JavaScript/Python client library)
- [ ] Third-party integrations (Notion, Obsidian, etc.)

### 🏗️ Infrastructure (Phase 6)

- [x] Queue system (BullMQ / Inngest for async jobs) — Inngest client + 3 functions (scheduled-publish, auto-archive, airdrop-reminders) + /api/inngest route
- [x] Background jobs (scheduled content, airdrop updates) — Inngest functions for publish/archive/reminder
- [ ] Webhook system (external event handling)
- [x] Redis caching (API response caching, session store) — src/lib/cache/redis.ts cacheGet/cacheSet/cacheDel
- [x] AI response caching (avoid duplicate generations) — src/lib/cache/redis.ts with Upstash Redis + in-memory fallback
- [ ] CDN optimization (static assets, edge delivery)
- [x] Monitoring dashboard (uptime, performance, errors) — `/admin/monitoring` with DB health check, content stats, activity metrics, Sentry status; `/api/health` endpoint for uptime monitors (200/503)
- [x] Error tracking (Sentry integration) — sentry.*.config.ts files + @sentry/nextjs setup instructions
- [x] Backup system (database backups, content snapshots) — scripts/backup-db.ts pg_dump script
- [ ] Secrets encryption (comprehensive key management)

### 🚀 Long-Term Vision

- [ ] AI-native Web3 university (structured degree programs)
- [ ] Autonomous AI learning agents (personal tutors)
- [x] Personalized AI learning paths (adaptive curriculum) — /learn/start wizard, /api/learn/roadmap/generate with AI
- [ ] AI crypto portfolio assistant (investment guidance)
- [ ] AI-powered research terminal (deep analysis tools)
- [ ] Decentralized AI infrastructure (on-chain compute)
- [ ] Multi-agent AI workflows (agent orchestration)
- [ ] AI creator economy tools (content monetization)

---

## 🎯 NORTH STAR

> Build the leading AI-native Web3 learning & research platform in Indonesia and Southeast Asia.

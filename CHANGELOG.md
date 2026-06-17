# Changelog

All notable project changes are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.10.3] — 2026-06-17

### 🔧 Polish Phase (Spec 001-content-expansion — T054-T060)

> Branch: `main`
> Final validation and build fixes for Content Expansion feature.

**Build Fixes:**
- Replaced 8 `asChild` Button prop instances with `buttonVariants` + `className` pattern (compatible with `@base-ui/react`)
  - `roadmap/page.tsx`: 3 instances (external links + internal Link)
  - `developers/page.tsx`: 2 instances (external links + internal Link)
  - `contribute/submit/page.tsx`: 3 instances (internal Links)
- Fixed `streamWithProviderFallback` call signature in `learn/roadmap/generate/route.ts` (3-arg → object pattern)
- Fixed `"placeholder" ||` always-truthy pattern in `referral/page.tsx` (2 instances → `process.env.NEXT_PUBLIC_APP_URL`)
- Migrated 3 Inngest functions to v4 API: trigger config moved into `createFunction` config object
  - `airdrop-reminders.ts`, `auto-archive.ts`, `scheduled-publish.ts`

**Validation Results (T054-T059):**
- ✅ T054: `prisma generate` + TypeScript compilation pass (build requires DB env vars)
- ✅ T055: Bilingual spot-check — 3 posts across categories, ID + EN versions verified
- ✅ T056: SEO metadata — 5 posts verified (title, excerpt, tags, category, language)
- ✅ T057: Blog listing — 20 new posts (5 per category) + 21 legacy = 41 total
- ✅ T058: Learn tracks — 30 Web3 + 32 AI pages (both >20 requirement)
- ✅ T059: Quickstart V1-V7 — all code infrastructure verified present

---

## [0.10.2] — 2026-06-12

### 🚀 Content Expansion (Spec-Driven Development)

> Branch: `feat/content-expansion`
> Spec: `specs/001-content-expansion/` — 60 tasks in 9 phases, 60/60 complete

**Blog Content (40 new bilingual MDX files):**

| Category | ID Posts | EN Posts | Total |
|----------|----------|----------|-------|
| Web3 Fundamentals | 5 | 5 | 10 |
| AI Tutorials | 5 | 5 | 10 |
| Airdrop Guides | 5 | 5 | 10 |
| Opinion/News | 5 | 5 | 10 |

**Learn Pages (42 new pages):**

| Track | New Sections | Pages |
|-------|-------------|-------|
| Web3 | Solidity Fundamentals, DeFi Deep Dive, DAO Advanced | 20 |
| AI | LLM Integration, Fine-tuning, RAG Production, AI Agent Development | 22 |

**Infrastructure:**
- Content similarity engine (Jaccard trigram, 80% threshold)
- Auto-archive opinion/news posts after 90 days
- Blog generator admin page with category-specific prompts
- Provider fallback for AI content generation
- Publish workflow with similarity block + admin override

**Bug Fixes (pre-existing):**
- `scheduled-publish/route.ts`: merged duplicate POST handler
- `blog/[slug]/page.tsx`: null/undefined type guards
- `faq/page.tsx`: declaration order fix
- `generate-blog/route.ts`: hardcoded provider fallback
- `analytics/read/route.ts`: rewrite to use PostView relation
- `analytics/popular/route.ts`: fix ordering
- `i18n/config.ts`: ContentLocale type definition
- `proxy.ts`: strict type for locales.includes
- `comparison.tsx`: guard undefined items from MDX parser

> Commits: `205ac9e`, `15e4960`, `7a8ed03`, `b480ca3`

---

## [0.10.1] — 2026-06-07

### 📝 Blog Content Expansion

> Commit: `360a587`

**17 New Blog Posts Added:**

| Category | Posts |
|----------|-------|
| Web3 Fundamentals | Apa itu Blockchain?, Layer 1 vs Layer 2, Cara Kerja Smart Contract, Apa itu DeFi?, Apa itu NFT? |
| DeFi | Impermanent Loss Penjelasan, Liquidity Pool, Yield Farming, Apa itu AMM?, DeFi Pins |
| AI & Web3 | Web3 AI Convergence, AI Agents in Crypto, Prompt Engineering for DeFi |
| Airdrop Guides | Strategi Airdrop, Lens Protocol Airdrop, zkSync Airdrop Guide |
| Technical | EIP-4844 Danksharding, Apa itu Gas Fees?, Cryptographic Basics |

**Quality Fixes:**
- Remove Chinese text from blog posts — replaced with Indonesian
- Fixed mixed-language content in: `web3-ai-convergence.mdx`, `eip-4844-danksharding.mdx`, `impermanent-loss-penjelasan.mdx`, `apa-itu-blockchain.mdx`, `layer-1-vs-layer-2.mdx`

> Commit: `0e8257d`

---

## [0.10.0] — 2026-06-05

### 🛠️ AI Tools Directory

> Commit: `649a50e`

**Schema:**
- Extended `AITool`: `pricingType` (enum FREE/FREEMIUM/PAID/SUBSCRIPTION), `pricingMin`, `websiteUrl`, `features/integrations/languages/platforms` (string arrays), `hasFreeTrial`, `hasApiAccess`, `hasMobileApp`, `viewCount`, `ratingCount`, `sponsored`
- New: `ToolReview` model (rating, title, content, helpful votes, verified, status PENDING/APPROVED/REJECTED)
- New: `ToolBookmark` (anonymous by session userId)
- New: `ToolCollection` + `ToolCollectionItem` (curated lists)

**Directory Page (`/ai-tools`):**
- Advanced multi-filter: category (dynamic from DB), pricing type, platform, hasFreeTrial, hasApiAccess
- Sort: rating, trending (viewCount), newest, name, views
- Sponsored tools float to top of results
- Compare: unlimited (max 20), sticky compare queue bar
- Active filter summary with per-filter clear

**Tool Detail (`/ai-tools/[slug]`):**
- `ViewTracker`: auto-increments viewCount on page load
- `BookmarkButton`: save/unsave tools (auth required)
- `ReviewsSection`: star ratings, review list with helpful voting, submit review (PENDING)
- Features, integrations, platforms displayed as badges

**Collections:**
- `/collections` — public listing (5 curated collections)
- `/collections/[slug]` — collection detail with tools
- `/admin/collections` — create/edit/delete collections, manage tools
- Seeded: Best Free AI Tools, AI for Developers, AI Image Generators, AI Writing Assistants, Web3 & Crypto AI Tools

**APIs:**
- `POST /api/tools/[slug]/view` — view count tracker
- `GET|POST /api/tools/[slug]/reviews` — list/submit reviews
- `POST /api/tools/[slug]/reviews/[reviewId]/helpful` — vote helpful
- `GET|POST|DELETE /api/tools/bookmarks` — list/toggle bookmarks
- `GET /api/tools/trending` — top 10 by viewCount

### 🎮 Gamification (Sprint 11)

> Commit: `4498dba`

**Schema:**
- `Achievement` model — tiers (BRONZE/SILVER/GOLD/PLATINUM/DIAMOND), triggers, XP rewards
- `UserAchievement` junction table with `earnedAt`, `xpAwarded`
- `Streak` model — `currentStreak`, `longestStreak`, `lastActiveDate`
- `Referral` model — unique codes, expiry, XP bonuses for both parties
- `DailyActivity` model — daily XP tracking per user
- `UserProfile` model — bio, social links, preferences
- Extended `User` model with relations

**Core Library (`src/lib/gamification.ts`):**
- `xpToLevel(xp)` — square-root formula (level = √(xp/100))
- `xpProgress(xp)` — 0–100% progress within current level
- `addXp(userId, amount, reason)` — atomic XP increment + level-up detection
- `recordActivity(userId, xpEarned)` — streak tracking, consecutive day detection
- `checkAchievements(userId, trigger)` — auto-award based on threshold
- `createReferralLink(userId)` / `useReferralCode(code, refereeId)` — 50 XP both parties
- `getLeaderboard(limit)` — top 50 by XP with rank, level, badge

**Public Pages:**
- `/leaderboard` — top 50 users, podium (gold/silver/bronze), rank list
- `/profile/[username]` — public profile: avatar, bio, social links, XP/streak/achievements
- `/achievements` — gallery grouped by tier, locked/unlocked state, trigger info

**Components:**
- `StreakWidget` — flame icon, current streak, weekly progress grid
- `XpBadge` — level badge with animated progress bar

**API Routes:**
- `GET /api/gamification/leaderboard` — public, top 50
- `GET|POST /api/gamification/streak` — auth required, record activity
- `GET /api/gamification/achievements` — auth optional (?include=all)
- `GET|POST /api/gamification/referral` — auth required

**Admin:**
- `/admin/achievements` — manage achievements, toggle active, create new
- `scripts/seed-achievements.ts` — 15 default achievements seeded

**Also:**
- Simple `Avatar` UI component (img-based, no compound pattern)
- `SeoType.profile` added to seo.ts

---

## [0.9.0] — 2026-06-05

### 🛡️ Security Hardening (Sprint 10 — Phase 7)

> Completed via 3 commits: `a9d011b`, `71c4e83`, `aaf8d35`, `1d506d6`

**Rate Limiting:**
- Integrated shared `rate-limiter.ts` across all AI routes
- Tiers: `strict` (8 req/min for admin), `normal` (30 req/min for public)
- Identity: IP-based for public, email-based for authenticated
- Applied to: `/api/research/assistant`, `/api/learn/chat`, `/api/content/translate`, `/api/admin/learn/*/generate`

**CSRF Protection:**
- Middleware conflict resolved: consolidated to `src/proxy.ts`
- Admin page routes: auth guard with VIEWER role redirect
- Admin API routes: 401/403 JSON responses for unauthenticated/unauthorized

**Security Headers (helmet):**
- Content-Security-Policy, X-Frame-Options, X-Content-Type-Options
- Referrer-Policy, Permissions-Policy, Strict-Transport-Security
- Applied globally via `src/proxy.ts` for every response

**Audit Logging:**
- Console + `AdminActivity` DB dual output
- Integrated into all admin action files:
  - `posts/actions.ts`: create, update, delete, publish, archive, approve, submit-review, restore-revision, add/remove-coauthor
  - `airdrops/actions.ts`: create, update, delete, bulk-update
  - `tools/actions.ts`: create, update, delete
  - `faq/actions.ts`: create, update, delete, reorder
  - `glossary/actions.ts`: create, update, delete, bulk-import

**Admin Activity Tracking:**
- `AdminActivity` Prisma model with indexes on `actorId`, `(resource, resourceId)`, `createdAt`
- `auditLog()` helper with level support (info/warn/error)
- `getRecentActivity()` for admin dashboard queries

**Bug Fixes:**
- `deletePostAction`: added missing auth check
- `deleteAirdropAction`, `deleteToolAction`, `deleteFaqEntryAction`: added missing auth
- Security headers conflict: helmet moved from `middleware.ts` to `proxy.ts`

---

## [0.8.0] — 2026-06-04

### 🚀 Airdrop Hub Upgrade (Sprint 10 — Phase 7)

> Commit: `0eb95ce`

**Real-time Price Tracking:**
- `/api/airdrop/price` — CoinGecko API with 5-minute cache
- `PriceDisplay` component with 24h change, market cap, volume
- Pool hash rate, block reward, active miners from AlphaPool

**Wallet Connect Integration:**
- wagmi + viem + @tanstack/react-query stack
- MetaMask, WalletConnect, Coinbase Wallet support
- `wagmi-provider.tsx`, `connect-button.tsx`, `wallet-modal.tsx`

**Task Completion Tracking:**
- `AirdropTask` + `UserAirdropProgress` models
- `/admin/airdrops/[id]/tasks` — task management UI
- Per-task XP rewards with completion tracking

**XP & Reward System:**
- `UserXP` model — XP auto-increment on task completion
- Level formula: `level = floor(sqrt(xp / 100))`
- XP breakdown per airdrop in detail page

**Airdrop Calendar:**
- `/airdrop/calendar` — timeline view with month grouping
- Event JSON-LD structured data for SEO
- Upcoming/active/ended visual distinction

**Notification System:**
- `NotificationBell` component with 60s polling
- `Notification` model — type, read/unread, links
- Mark as read via API

**AI Risk Scoring:**
- GPT-4o analysis returning score 1–100
- LOW/MEDIUM/HIGH/SCAM levels with reasoning
- `RiskAnalysisPanel` component in airdrop detail

**Community Reviews:**
- `AirdropReview` model — rating 1–5, text review, helpful votes
- Rating summary with distribution bars
- Helpful/not-helpful voting system

**Scam Detection:**
- Integrated with AI Risk Scoring
- Red flags analysis: fake socials, promised guarantees, no code, etc.
- Visual SCAM badge with warning panel

---

## [0.7.0] — 2026-06-03

### 📐 Content Scaling (Sprint 9 — Phase 6)

> Commit: `4ba14ed`

**Auto-generate Glossary Pages:**
- `/glossary`, `/glossary/[slug]`, `/en/glossary`
- `/admin/glossary` — CRUD with publish controls
- `GlossaryEntry` model, slug/term/category/definition/example
- FAQPage JSON-LD for SEO

**Auto-generate Comparison Pages:**
- `/ai-tools/compare` — select 2–8 tools
- 8 comparison criteria: pricing, free tier, API, etc.
- AI summary generation (GPT-4o-mini)
- Copy/share comparison links, tool badges

**Auto-generate Tool Pages:**
- `/admin/tools/import` — single URL import with OpenGraph parsing
- Bulk JSON/CSV import
- Auto-fetch: name, tagline, description, logo, website

**Auto-generate FAQ Pages:**
- `/faq`, `/admin/faq`, `/en/faq`
- `Faq` model with language, category, order
- AI generation via GPT-4o-mini (bulk mode, history)
- FAQPage JSON-LD schema

**AI Content Localization:**
- `/admin/content/localization` — translateText() via GPT-4o-mini
- Bulk translate selected posts
- Translation history tracking

**Multi-language Support (i18n):**
- `/en/blog`, `/en/glossary`, `/en/faq` routes
- `src/lib/translations.ts` — 50+ bilingual strings
- Language switcher component in nav
- hreflang tags for SEO

**Indonesian SEO Expansion:**
- ID Organization schema, LocalBusiness, AggregateReview
- `/api/seo/indonesian` endpoint

**English SEO Expansion:**
- EN blog listing, `/api/seo/english` endpoint
- Bilingual post linking
- hreflang for EN/ID pages

---

## [0.6.0] — 2026-06-02

### 🔍 AI Research Center + AI Learn System (Sprint 8 — Phase 5)

> Commits: `5d38212`, `0ac2642`

**AI Research Center (9 features):**
- `/research` — crypto + AI research workspace
- Chat with market data, on-chain analysis, token charts
- Trading signals, whale tracking, DeFi analytics, NFT tools

**AI Learn System:**
- `/learn` + `/learn/[...slug]` — lesson pages with MDX content
- Lesson/quiz/flashcard generators via GPT-4o-mini
- `/learn/generator` — AI lesson studio (admin)
- `/learn/roadmaps` + `/learn/roadmap/[id]` — visual curriculum
- `/learn/roadmap-visualizer` — interactive roadmap component
- `roadmap-visualizer.tsx` — zoomable, pannable SVG canvas
- Tutor sidebar: explain, simplify, translate, TTS
- Admin analytics dashboard: views, completions, quiz scores

---

## [0.5.0] — 2026-06-01

### 🎓 Learn System Phase 1 + AI Writer Upgrade (Sprint 7 — Phase 4)

> Commits: `dfb285d`, `a47e65d`, `ce1539a`

**Learn System Phase 1:**
- `/learn/roadmap` — visual roadmap builder
- Lesson/quiz/flashcard generators
- Progress tracking per user

**AI Writer Upgrade:**
- Multi-step workflow: outline → draft → review → publish
- Real-time token usage tracking
- Word count, reading time display
- Full-screen editor with toolbar

---

## [0.4.0] — 2026-05-31

### 🔗 Airdrop System Core (Sprint 6 — Phase 4)

> Commits: `b7fb696`, `3250097`

**Airdrop Core:**
- `/airdrop` listing with filters (status, network, difficulty)
- `/airdrop/[slug]` detail with step tracker
- `/admin/airdrops` — full CRUD
- Airdrop model: name, slug, network, status, difficulty, requirements, steps, links
- `PostViewTracker` — fires tracking API on mount, tracks reading time

**Content Engine (partial):**
- AI-powered content generation for airdrops
- SEO + analytics tracking

---

## [0.3.0] — 2026-05-30

### 📣 Content Engine + SEO System (Sprint 5 — Phase 3)

> Commits: `ad6dbcd`, `b2ffc1f`, `389b286`

**Content Engine:**
- Multi-author support
- Post revisions with version history
- Approval workflow: DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED → ARCHIVED
- Editorial dashboard with pending reviews
- Post view tracking with reading time

**SEO System (10 items):**
- JSON-LD structured data: WebSite, Article, BreadcrumbList, ItemList
- `JsonLd` (client) + `JsonLdScript` (server-safe) components
- Sitemap XML auto-generation
- Robots.txt
- OpenGraph + Twitter Card meta
- Canonical URLs, hreflang tags
- JSON-LD for blog listing, topics, authors

---

## [0.2.0] — 2026-05-29

### ✍️ AI Writer + Blog Studio (Sprint 4 — Phase 2)

> Commit: `25c64e2`

**AI Writer:**
- `/admin/ai-writer` — workspace with outline/draft/review/publish steps
- GPT-4o-mini generation with token usage
- Topic input, target audience, tone, word count controls

**Blog Studio:**
- `/admin/posts/new` — post editor with live preview
- Rich toolbar: headings, bold, italic, lists, links, code blocks
- Tag input, category selector, excerpt, featured image
- Schedule publishing support

---

## [0.1.0] — 2026-05-28

### 📝 Blog System + Taxonomy (Sprint 3 — Phase 1)

> Commit: `cdf5fbe`

**Blog Core:**
- `/blog` listing with featured post hero
- `/blog/[slug]` — full post view with TOC, reading time, share
- Categories, tags, author pages
- Related posts recommendation
- Social share buttons

**Admin:**
- `/admin/posts` — list with status filters
- `/admin/posts/[id]/edit` — editor with publish controls
- Post revisions browser

---

## [0.0.1-beta] — 2026-05-27

### 🏗️ Foundation + Auth (Sprint 2 — Phase 0/1)

> Commits: `6391542`, `b8562fb`

**Foundation:**
- Next.js 15 App Router with TypeScript
- Prisma ORM + PostgreSQL (production: 8.222.244.54)
- NextAuth.js v5 with Credentials + GitHub providers
- Role-based access: ADMIN, EDITOR, AUTHOR, VIEWER
- Dark theme UI with Tailwind CSS
- Mobile responsive navigation

**Public Pages:**
- Homepage, `/blog`, `/topics`, `/topics/[slug]`
- `/learn`, `/learn/[...slug]`
- `/ai-tools`, `/ai-tools/[slug]`
- `/airdrop`, `/research`, `/search`
- `/admin/dashboard`, `/admin/posts`, `/admin/airdrops`, `/admin/tools`

---

## [0.0.0] — 2026-05-26

### 🎯 Initial Commit

> Commit: `6330a22`

- Project initialized: Web3AI Hub
- Next.js 15, App Router, TypeScript, Tailwind CSS, Prisma
- Basic project structure and documentation
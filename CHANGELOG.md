# Changelog

All notable project changes are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — Sprint 11: Gamification

**Started:** 2026-06-05

### 🎮 Gamification (in progress)

- [ ] User profiles (bio, avatar, social links, learning stats)
- [ ] Achievement badges (complete track, first post, streak milestones)
- [ ] Learning XP system (XP per lesson/quiz, level progression)
- [ ] Referral system (invite link, bonus XP)
- [ ] Community leaderboard (weekly/monthly)
- [ ] Daily streak system (consecutive day tracking, streak rewards)

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
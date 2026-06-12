# Web3AI Hub (AI3) Constitution

> Platform Web3 & AI #1 di Indonesia — Blog MDX, Learn (GitBook-style), Airdrop Hub, AI Tools Directory.
> Solo creator platform dengan AI-powered content generation, bilingual (ID/EN).

## Core Principles

### I. App Router First, Server Default
Every feature MUST use Next.js App Router (`src/app/`). Pages Router is forbidden. Default to Server Components; use `"use client"` only when interactivity is required (event handlers, hooks, browser APIs). Data fetching happens server-side with ISR revalidation. Client Components are leaf nodes in the component tree.

### II. Bilingual by Default (ID + EN)
All user-facing content must support Indonesian (`id`, default) and English (`en`). Content is authored in Indonesian first, then translated via AI or manual. i18n routing uses `[locale]` segment. MDX content has `language` frontmatter field. API responses use locale-aware queries. SEO alternates must reference both language versions.

### III. AI-Augmented, Not AI-Dependent
AI (OpenAI, Anthropic, Google, Groq) enhances content creation — AI Writer, translations, research assistant, risk scoring, FAQ/glossary generation — but all AI output goes through human review before publishing. Provider abstraction with fallback chain ensures availability. API keys encrypted with AES-256. Rate limiting on all AI endpoints. AI never has final publishing authority.

### IV. Security & Privacy First
- Password hashing: scrypt with timing-safe comparison
- Auth: NextAuth.js v5 with JWT sessions, role-based access (ADMIN/EDITOR/AUTHOR/VIEWER)
- Security headers: CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff
- Rate limiting on all public API routes
- Audit logging for all admin actions (AdminActivity model)
- Environment validation via Zod on startup
- No secrets in code — all via .env with .env.example as template

### V. Content Quality & SEO Excellence
- MDX for all content (blog, learn, airdrop) with custom components (callout, code-block, comparison, youtube-embed)
- Conventional Commits (feat, fix, docs, style, refactor, perf, test, chore, ci)
- SEO automation: JSON-LD, Open Graph images (API route), sitemap, robots.txt, canonical URLs
- Topic clusters and internal linking strategy
- Reading time, word count, and structured frontmatter validation

### VI. Performance Budget
- LCP ≤ 2.5s, Lighthouse score ≥ 90
- ISR with content-type-specific revalidation intervals
- Image optimization via Next.js Image component
- Code splitting and lazy loading for heavy components
- Database queries optimized with Prisma select/include patterns
- No blocking client-side data fetching for initial page load

### VII. Solo Creator Workflow with Quality Gates
This is a solo creator platform (Abraham Yusuf). The workflow prioritizes speed without sacrificing quality:
- Admin-only content creation and publishing
- Multi-step review: DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED
- CI pipeline: lint → typecheck → build on every push
- Tests required for critical paths (auth, AI, API responses)

## Tech Stack Constraints

### Required Stack (Non-Negotiable)
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui (base-nova style, lucide icons)
- **Database**: PostgreSQL (Neon) via Prisma 6+
- **Auth**: NextAuth.js v5 (beta)
- **AI SDK**: Vercel AI SDK (`ai` package)
- **Web3**: wagmi + viem for wallet connectivity
- **State**: Zustand for client state
- **Content**: MDX via next-mdx-remote + gray-matter
- **Validation**: Zod for all runtime validation (env, API input, auth)
- **Deployment**: Vercel (primary), Cloudflare R2 (media storage)
- **Analytics**: Umami (self-hosted) + Google Analytics

### Prohibited
- Pages Router (`src/pages/`)
- Class components
- `any` type without explicit justification (eslint warn)
- Direct Prisma usage outside `src/lib/prisma.ts` singleton
- Hardcoded secrets, API keys, or credentials
- Client-side data fetching for initial page content
- Unvalidated user input reaching database or AI providers

### File & Naming Conventions
- **Files**: kebab-case (`blog-listing-client.tsx`)
- **Components**: PascalCase (`BlogListingClient`)
- **Hooks**: camelCase with `use` prefix (`usePostViews`)
- **API routes**: RESTful (`/api/posts/[id]`)
- **Path alias**: `@/*` → `./src/*`
- **Prisma models**: PascalCase, relations explicit, indexes on slugs and foreign keys

## Domain Architecture

### Feature Modules
1. **Blog System** — MDX posts with categories, tags, revisions, view tracking, scheduled publishing, AI writer
2. **Learn System** — GitBook-style tracks (Web3/AI), sections, pages, quizzes, flashcards, progress tracking, user roadmaps
3. **Airdrop Hub** — Airdrop listings with risk scoring (AI), reviews, tasks (XP), calendar, price tracking, wallet connect, scam detection
4. **AI Tools Directory** — Curated tool catalog with reviews, bookmarks, collections, comparison, affiliate tracking
5. **Gamification** — XP system, achievements (5 tiers), streaks, referrals, leaderboard, daily activity
6. **Admin Dashboard** — Content management, AI writer, analytics, SEO tools, settings, user management
7. **Research Center** — AI-assisted research, FAQ generation, glossary management
8. **Monetization** — Google AdSense slots, affiliate links, sponsored listings, premium content (planned)

### Data Flow Pattern
```
User Request → Middleware (security headers, i18n, auth guard)
  → App Router (Server Component)
    → Prisma (singleton, select/include optimization)
      → PostgreSQL (Neon)
    → Response (ISR cached or dynamic)
```

For AI features:
```
Admin Input → API Route (validated with Zod)
  → AI Provider (with fallback chain: primary → all others)
    → Stream response → Client
  → Audit log (AdminActivity)
```

## Development Workflow

### Branch Strategy
- `main` — production-ready code
- Feature branches: `feat/`, `fix/`, `docs/` prefixes
- All pushes trigger CI (lint, typecheck, build)
- PR process: branch → quality check → commit → push → review → merge

### Quality Gates
1. **Lint**: ESLint with next/core-web-vitals + next/typescript
2. **Typecheck**: `tsc --noEmit` (strict mode)
3. **Build**: `prisma generate && next build` (must succeed)
4. **Tests**: Node.js test runner (`tsx`) for critical paths
5. **No regressions**: Existing tests must pass before new features

### Content Workflow
1. Author creates draft in admin (or AI Writer generates)
2. Admin reviews, edits, approves
3. Published with SEO metadata, OG image, structured data
4. Indexed for search, internal linking, topic clusters
5. Analytics tracking (views, reading time, engagement)

### Sprint Cadence
- 2-week sprints, 10 sprints across 7 phases (completed)
- Current: v0.10.1 — Polish phase, preparing for launch
- Next priorities: Performance audit, testing expansion, content scaling, monetization

## Security Standards

### Authentication
- NextAuth.js v5 with Credentials provider
- Bootstrap admin from environment variables (first-run only)
- scrypt password hashing with custom format: `$2b$<salt>$<hash>`
- Legacy plaintext migration on successful login
- JWT sessions with role/id/username callbacks
- Admin/Editor role required for all `/admin/*` routes

### API Security
- Zod validation on all API inputs
- Rate limiting per IP/session
- CSRF protection via NextAuth
- Security headers enforced in middleware
- No CORS for cross-origin API access

### Data Protection
- AI provider API keys encrypted with AES-256
- Database credentials via environment variables only
- `.env` gitignored, `.env.example` as template
- Admin activity audit trail with IP and user agent

## Performance Standards

### Targets
- LCP: ≤ 2.5s (mobile), ≤ 1.5s (desktop)
- Lighthouse Performance: ≥ 90
- Lighthouse Accessibility: ≥ 90
- Lighthouse SEO: ≥ 95
- First Contentful Paint: ≤ 1.8s

### Optimization Strategy
- ISR with per-content-type revalidation (blog: 1h, learn: 6h, airdrop: 15min)
- Prisma select/include for minimal data transfer
- Next.js Image with blur placeholders
- Code splitting per route group
- Font optimization (Geist, preloaded)
- Lazy load heavy components (charts, editors, wallet modal)

## Governance

This constitution is the source of truth for all development decisions in Web3AI Hub. Every feature spec, implementation plan, and task must comply with these principles.

**Amendment Process**: Changes require documentation in CHANGELOG.md, updated constitution version, and migration plan if breaking existing patterns.

**Compliance Check**: All PRs and implementations must verify compliance with security standards, performance budget, and naming conventions.

**Guidance Files**:
- `docs/CLAUDE.md` — AI development assistant guide (621 lines, detailed patterns)
- `docs/PRD.md` — Product Requirements Document (personas, features, success metrics)
- `docs/ROADMAP.md` — 8-phase development plan
- `docs/IMPLEMENTATION_SPRINT_PLAN.md` — Sprint breakdown
- `CONTRIBUTING.md` — Developer guide and conventions

**Version**: 1.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12

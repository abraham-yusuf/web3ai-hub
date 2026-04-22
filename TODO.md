# TODO — Implementation Sprint Plan Status

## Sprint 1 — Phase 0 (Foundation Hardening)
- [x] Environment & Config — .env.example documented with dev/staging/prod modes, zod validation covers all providers including Resend and APP_URL, staging password check added.
- [x] Quality Gate — CI generates Prisma client before typecheck, build unblocked.
- [x] Auth Baseline — Passwords hashed with scrypt (timing-safe), auto-migration from plaintext on login, middleware-level admin protection added.
- [x] Security Baseline — Standardized API error handler with AppError/NotFoundError/ForbiddenError classes, Prisma error mapping, consistent JSON shape across all routes.

## Sprint 2 — Phase 1 (Blog Core Reader Experience)
- [x] Reading UX — TOC, reading time/word count, and share buttons rendered on blog detail.
- [x] Discovery — Related posts plus prev/next navigation implemented.
- [x] SEO Baseline Blog — Per-post metadata with canonical + Article JSON-LD in place.

## Sprint 3 — Phase 1 (Blog Admin + Taxonomy)
- [x] Blog Admin CRUD — Admin list/create/edit/delete with draft/publish/schedule and preview flows.
- [x] Taxonomy — Category/tag models with category/tag listing routes available.
- [x] Operational Content Flow — Slug availability checker and preview mode before publish implemented.

## Sprint 4 — Phase 1 (AI Writer)
- [x] Provider Layer — Multi-provider abstraction with fallback order and default models.
- [x] AI Generation API — Streaming admin endpoint with rate limiting and observability logs.
- [x] Admin UX — AI writer form supports topic/tone/length/template, regen/copy/insert to editor.
- [x] Settings & Key Management — Admin settings page saves per-provider model/temp/encrypted API keys.

## Sprint 5 — Phase 3 (Monetisasi + SEO Hardening)
- [x] Ad Infra — Reusable AdSlot with role-based suppression and section-based config.
- [x] Placement — Ad slots wired on blog, learn, and AI tools listing/detail; hide for admin/editor.
- [x] SEO Hardening — Canonical metadata, robots/sitemap routes, and internal linking block present.

## Sprint 6 — Phase 4 (Learn Module Part 1)
- [x] Navigation UX — Sidebar hierarchy, breadcrumb, and prev/next lesson navigation live.
- [ ] Data Migration — DB-backed learn structure exists but content still sourced from MDX files (no migrated data).
- [ ] Content Expansion — Web3 basics/AI basics tracks are minimal; expansion not completed.

## Sprint 7 — Phase 4 (Learn Module Part 2)
- [x] Contextual AI Chat — Lesson-aware sidebar chat with streaming responses and quick prompts.
- [x] Progress Tracking — Local storage toggle with optional DB sync for logged-in users.
- [ ] Retention UX — Continue learning card exists; completion badges/dashboard surfacing not implemented.

## Sprint 8 — Phase 5 (Airdrop Hub Full)
- [x] Search & Filter — Server-driven search/filter/sort with URL-synced query params.
- [x] Detail Experience — Requirements checklist, social links, related airdrops, and report issue flow.
- [ ] Admin Operations — CRUD available; bulk status updates and AI tutorial helper are missing.

## Sprint 9 — Phase 6 (AI Tools Directory Full)
- [x] Compare Feature — Compare up to 3 tools with shareable query string.
- [x] Monetization Hooks — Affiliate click redirect with tracking plus featured badges.
- [ ] Admin + Data Seeding — Admin CRUD exists; large-scale data seeding (100 tools) not done.

## Sprint 10 — Phase 7 (Polish, QA, Launch)
- [x] Global Search — Cross-module search page covering blog/learn/airdrop/tools.
- [ ] Reliability — Error boundaries/loading states are basic; no dedicated 404/500 polish beyond defaults.
- [ ] Testing — No unit/integration/E2E tests implemented.
- [ ] Analytics & Launch Ops — GA4/GSC events and launch checklist are absent.

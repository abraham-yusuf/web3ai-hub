# Implementation Plan: Content Expansion

**Branch**: `content-expansion` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-content-expansion/spec.md`

## Summary

Expand AI3 platform content library with 20+ blog posts across 4 categories (Web3 Fundamentals, AI Tutorials, Airdrop Guides, Opinion/News) and 40+ Learn track pages (20 Web3 + 20 AI). Content generated one-by-one via existing AI Writer with admin review before each publish. Opinion/news articles auto-archive after 90 days. Similarity detection blocks duplicate publish with admin override.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router)

**Primary Dependencies**: Prisma 6, Vercel AI SDK (`ai`), OpenAI/Anthropic/Google/Groq providers, next-mdx-remote, gray-matter, shiki, Zod, Zustand, shadcn/ui

**Storage**: PostgreSQL (Neon) — existing Prisma schema with Post, LearnTrack, LearnSection, LearnPage, Quiz, Flashcard models

**Testing**: Node.js test runner (`tsx`), existing test pattern in `tests/`

**Target Platform**: Vercel (Next.js deployment), browser (desktop + mobile)

**Performance Goals**: LCP ≤ 2.5s, Lighthouse ≥ 90, draft-to-publish ≤ 30 min per artikel

**Constraints**: Solo creator workflow (admin-only), bilingual ID/EN, existing AI rate limiting (8/min admin, 30/min public)

**Scale/Scope**: 20 new blog posts + 40 new Learn pages + quizzes + flashcards. One-by-one generation workflow.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. App Router First, Server Default | ✅ PASS | All new routes use App Router, Server Components default |
| II. Bilingual by Default | ✅ PASS | Each post has `language` field, i18n routing via `[locale]` |
| III. AI-Augmented, Not AI-Dependent | ✅ PASS | One-by-one workflow with human review before publish |
| IV. Security & Privacy First | ✅ PASS | Existing auth, rate limiting, audit logging apply |
| V. Content Quality & SEO | ✅ PASS | MDX + custom components, SEO metadata auto-generated |
| VI. Performance Budget | ✅ PASS | ISR with content-type revalidation, no new client bundles |
| VII. Solo Creator Workflow | ✅ PASS | Admin-only, DRAFT→PUBLISH pipeline |

**Post-Phase 1 Re-check**: All gates still pass. No new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-content-expansion/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   ├── blog-content-api.md
│   └── learn-content-api.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/
│   │   ├── blog/                    # Existing — no structural changes
│   │   └── learn/[...slug]/         # Existing — new pages added
│   ├── admin/
│   │   ├── ai-writer/               # Existing — new blog templates added
│   │   ├── learn/                   # Existing — Learn content management
│   │   └── posts/                   # Existing — blog post management
│   └── api/
│       ├── admin/ai/                # Existing — AI generation endpoints
│       ├── ai/                      # Existing — AI translate, FAQ, glossary
│       └── learn/                   # Existing — learn CRUD + AI endpoints
├── components/
│   ├── blog/                        # Existing — no new components needed
│   └── learn/                       # Existing — sidebar, chat, roadmap
└── lib/
    ├── ai/                          # Existing — provider abstraction
    ├── blog.ts                      # Existing — blog utilities
    ├── learn.ts                     # Existing — learn utilities
    └── mdx.ts                       # Existing — MDX pipeline

prisma/
├── schema.prisma                    # Modified — add archivedAt, similarity fields
└── seed.ts                          # Modified — add new Learn content seed data

content/
├── blog/                            # New — 20+ MDX blog posts
│   ├── web3-fundamentals/           # 5 posts
│   ├── ai-tutorials/                # 5 posts
│   ├── airdrop-guides/              # 5 posts
│   └── opinion-news/                # 5 posts
└── learn/
    ├── web3-basics/                 # Existing + 20 new pages
    └── ai-basics/                   # Existing + 20 new pages

tests/
├── content-expansion.test.ts        # New — content generation + similarity tests
└── learn-track.test.ts              # New — Learn page + quiz tests
```

**Structure Decision**: Using existing Next.js App Router structure. No new directories at root level — all content fits within existing `src/app/`, `content/`, and `prisma/` patterns. Blog posts stored as MDX files in `content/blog/`, Learn pages stored in database via Prisma (existing pattern).

## Complexity Tracking

> No constitution violations detected. All implementation follows existing patterns.

No complexity additions required. This feature is a content expansion that leverages existing infrastructure (AI Writer, MDX pipeline, Prisma schema, i18n routing).

# Research: Content Expansion

**Date**: 2026-06-12
**Feature**: Content Expansion (001-content-expansion)

## Phase 0: Research Findings

### R1: One-by-One Content Generation Workflow

**Decision**: Generate 1 draft at a time via existing AI Writer, admin reviews and publishes before moving to next.

**Rationale**:
- Allows prompt tuning per article if AI output quality varies
- Admin can maintain consistent voice and style across articles
- Reduces risk of batch-generating 20 low-quality articles
- Fits solo creator workflow (one person reviewing)

**Alternatives considered**:
- Batch generation (all 20 at once): Rejected — high risk if prompt produces bad output
- Category batch (5 at a time): Rejected — still too much review overhead for solo creator

**Implementation approach**:
- Extend existing AI Writer admin page with new "Blog Content" templates per category
- Each template has category-specific prompts (Web3 fundamentals, AI tutorials, etc.)
- Generate → Preview → Edit → Approve → Publish flow per article
- Scheduled publish option for queueing articles

### R2: Auto-Archive for Opinion/News Articles

**Decision**: Add `archivedAt` field to Post model. Cron job or middleware checks age and auto-archives articles in "opinion-news" category after 90 days.

**Rationale**:
- Opinion/news content becomes outdated quickly
- Archived articles still accessible via direct URL for SEO value
- Keeps blog listing fresh and relevant
- No manual intervention needed

**Alternatives considered**:
- Manual archive only: Rejected — admin will forget, stale content accumulates
- Delete old articles: Rejected — loses SEO juice and backlinks
- Tag-based filtering: Rejected — doesn't solve the "stale content in listing" problem

**Implementation approach**:
- Add `archivedAt DateTime?` field to Post model
- Add category field value "opinion-news" (already exists as enum or string)
- Middleware or API route checks: if category = "opinion-news" AND publishedAt + 90 days < now → set archivedAt
- Blog listing query filters: `archivedAt IS NULL` (default view)
- Direct URL access still works (no redirect, just hidden from listing)

### R3: Content Similarity Detection

**Decision**: Text similarity check using existing content comparison. Block publish if >80% similarity, admin can override with reason.

**Rationale**:
- Prevents accidental duplicate content (AI can generate similar outputs)
- 80% threshold balances between catching duplicates and allowing related content
- Admin override handles intentional series/related articles
- Override reason provides audit trail

**Alternatives considered**:
- External plagiarism API (Copyscape, etc.): Rejected — adds external dependency and cost
- Simple exact-match dedup: Rejected — misses paraphrased duplicates
- No detection: Rejected — risk of publishing near-identical content
- Warn only (no block): Rejected — too easy to ignore

**Implementation approach**:
- Compare new article content against existing published posts
- Use text similarity algorithm (Jaccard similarity on n-grams or TF-IDF cosine similarity)
- Calculate similarity score per existing post
- If max similarity > 80% → block publish, show matching article
- Admin override UI with required reason field
- Log override in AdminActivity for audit

### R4: Learn Track Content Length Standardization

**Decision**: Target 800-1500 kata per Learn page. Consistent depth across all pages.

**Rationale**:
- Sweet spot for self-paced learning (not too short, not overwhelming)
- Mobile-friendly reading length (5-8 min read)
- Consistent experience across all Learn pages
- Enough depth to explain concepts with examples

**Alternatives considered**:
- Short (300-600 kata): Rejected — too shallow for learning, feels like flashcards
- Long (1500-3000 kata): Rejected — learner fatigue, especially on mobile
- Variable length: Rejected — inconsistent experience, hard to estimate completion time

**Implementation approach**:
- AI Writer prompt enforces 800-1500 word target
- wordCount field validated on save
- Warning if content < 800 or > 1500 kata
- Reading time calculated from wordCount

### R5: AI Provider Fallback for Content Generation

**Decision**: Use existing `streamWithProviderFallback()` pattern from `src/lib/ai/providers.ts` for content generation.

**Rationale**:
- Already implemented and tested in the codebase
- Tries primary provider, falls back to all others automatically
- No new infrastructure needed
- Handles provider downtime gracefully

**Alternatives considered**:
- Manual provider selection per article: Rejected — adds UX complexity
- Queue with retry: Rejected — over-engineering for one-by-one workflow
- Single provider only: Rejected — no resilience

**Implementation approach**:
- Content generation API routes use existing provider fallback
- If all providers fail → save as "pending_generation" status
- Admin can retry generation from admin UI
- No new code needed in provider layer

### R6: MDX Content Pipeline for Blog Posts

**Decision**: Use existing MDX pipeline (`src/lib/mdx.ts`) with next-mdx-remote. Blog posts stored as MDX files in `content/blog/` directory.

**Rationale**:
- Existing pipeline handles frontmatter parsing, custom components, syntax highlighting
- File-based content works well with ISR revalidation
- Version control for content (git-tracked MDX files)
- Already supports bilingual content via `language` frontmatter field

**Alternatives considered**:
- Database-stored blog content: Rejected — loses git versioning, harder to review diffs
- Headless CMS (Sanity, Contentful): Rejected — adds external dependency, overkill for solo creator
- Hybrid (DB + files): Rejected — complexity without clear benefit

**Implementation approach**:
- New MDX files in `content/blog/<category>/<slug>.mdx`
- Frontmatter: title, slug, excerpt, category, tags, language, coverImage, publishedAt, status
- AI Writer generates MDX content, admin edits in admin UI, saves to file system
- ISR revalidation on publish (existing pattern)

### R7: Learn Page Storage Strategy

**Decision**: Learn pages stored in database via Prisma (existing LearnPage model). Content is MDX stored as string field.

**Rationale**:
- Existing Learn system already uses Prisma models (LearnTrack, LearnSection, LearnPage)
- Progress tracking requires database state anyway
- Quiz and flashcard data tightly coupled to page
- Admin UI already manages Learn content via API

**Alternatives considered**:
- File-based Learn content: Rejected — progress tracking needs DB, would require hybrid
- External CMS: Rejected — same as R6

**Implementation approach**:
- New LearnPage records via admin UI or seed script
- Content field stores MDX string
- Quiz and Flashcard records linked by pageSlug
- Progress tracking via existing LearnProgress model

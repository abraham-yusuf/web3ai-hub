# Quickstart: Content Expansion Validation

**Date**: 2026-06-12
**Feature**: Content Expansion (001-content-expansion)

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Neon) configured
- `.env` file with all required variables (see `.env.example`)
- Admin account available (admin@web3aihub.com)
- At least 1 AI provider API key configured (OpenAI, Anthropic, Google, or Groq)

## Setup

```bash
# 1. Clone and install
git clone https://github.com/abraham-yusuf/web3ai-hub.git
cd web3ai-hub
npm install

# 2. Database setup
npx prisma generate
npx prisma db push

# 3. Seed base data (if fresh install)
npm run db:seed

# 4. Start dev server
npm run dev
```

## Validation Scenarios

### V1: Blog Content Generation (One-by-One)

**Goal**: Verify admin can generate, review, and publish a single blog post.

```text
1. Login to /admin as admin
2. Navigate to /admin/ai-writer
3. Select "Blog Content" template
4. Choose category: "Web3 Fundamentals"
5. Enter topic: "Apa Itu Blockchain?"
6. Click "Generate"
7. Verify: Draft appears with title, content, excerpt, tags, reading time
8. Edit content if needed
9. Click "Check Similarity"
10. Verify: Similarity score < 80%, no block
11. Click "Publish"
12. Verify: Article appears at /blog/[slug]
13. Verify: English version available at /en/blog/[slug]
14. Verify: SEO metadata present (view source → title tag, meta description, OG tags)
```

**Expected**: Article published successfully, visible in blog listing, bilingual, SEO-ready.

---

### V2: Similarity Block & Override

**Goal**: Verify similarity detection blocks near-duplicate content.

```text
1. Generate a blog post about "Apa Itu Blockchain?" (same topic as V1)
2. Click "Check Similarity"
3. Verify: Similarity score > 80%, BLOCKED message appears
4. Verify: Matching article shown with similarity percentage
5. Try to publish without override reason
6. Verify: Publish blocked with error message
7. Enter override reason: "This is part 2 of blockchain series"
8. Click "Publish with Override"
9. Verify: Article published successfully
10. Check /admin/posts → verify override reason logged
```

**Expected**: Near-duplicate blocked, override works with audit trail.

---

### V3: Auto-Archive (Opinion/News)

**Goal**: Verify opinion/news articles auto-archive after 90 days.

```text
1. Publish an opinion/news article (or set publishedAt to 91 days ago in DB)
2. Run auto-archive check (API or scheduled job)
3. Verify: Article has archivedAt timestamp
4. Visit /blog → verify article NOT in listing
5. Visit article URL directly → verify article IS accessible
6. Verify: "Archived" badge visible on article page
7. Visit /admin/posts → verify article shows "Archived" status
```

**Expected**: Article hidden from listing, accessible via URL, status shows archived.

---

### V4: Learn Page Generation (Web3 Track)

**Goal**: Verify admin can generate a Learn page with quiz and flashcards.

```text
1. Login to /admin
2. Navigate to /admin/learn
3. Select "Web3" track → "Solidity Fundamentals" section
4. Click "Generate New Page"
5. Enter topic: "Smart Contract Pertama"
6. Click "Generate"
7. Verify: Page content (800-1500 words), quiz (3+ questions), flashcards (5+ cards)
8. Edit if needed
9. Click "Save"
10. Navigate to /learn/web3-basics/solidity-fundamentals
11. Verify: New page appears in sidebar
12. Click "Mark Complete"
13. Verify: Progress bar updates, XP earned
14. Complete quiz
15. Verify: Score shown, XP earned
```

**Expected**: Learn page generated with quiz + flashcards, progress tracking works.

---

### V5: Learn Track Content Completeness

**Goal**: Verify Learn tracks have 20+ pages each.

```text
1. Visit /learn/web3-basics
2. Count total pages in sidebar
3. Verify: ≥ 20 pages across all sections
4. Visit /learn/ai-basics
5. Count total pages in sidebar
6. Verify: ≥ 20 pages across all sections
7. Visit /profile/[username]
8. Verify: Progress stats show both tracks
```

**Expected**: Both tracks have 20+ pages, progress tracking functional.

---

### V6: Bilingual Content

**Goal**: Verify all blog posts have ID and EN versions.

```text
1. Visit /blog → list all posts
2. For each post, verify: Indonesian version exists
3. Switch language to English (/en/blog)
4. Verify: English versions of all posts exist
5. Verify: Content is readable and accurate (spot-check 3 articles)
6. Verify: SEO alternates link tags present in HTML
```

**Expected**: All 20+ posts bilingual, SEO alternates configured.

---

### V7: Content Fallback (Provider Down)

**Goal**: Verify AI generation falls back to alternative provider.

```text
1. Set invalid API key for primary AI provider in admin settings
2. Try to generate a blog post
3. Verify: Generation succeeds using fallback provider
4. Check AdminActivity log → verify fallback event logged
```

**Expected**: Content generation succeeds despite primary provider failure.

---

## Success Criteria Validation

| SC | Validation | Pass? |
|----|------------|-------|
| SC-001 | 20+ blog posts, 5+ per category | V1, V2 |
| SC-002 | 20+ Web3 Learn pages with progress | V4, V5 |
| SC-003 | 20+ AI Learn pages with progress | V5 |
| SC-004 | Bilingual ID + EN | V6 |
| SC-005 | 95% AI content passes review | V1 (manual check) |
| SC-006 | Draft-to-publish ≤ 30 min | V1 (manual timing) |
| SC-007 | Quiz 3+ questions, 5+ flashcards per page | V4 |
| SC-008 | SEO metadata valid | V1 (view source) |
| SC-009 | Similarity block + override | V2 |
| SC-010 | Learn content accessible without error | V4, V5 |
| SC-011 | 800-1500 kata per Learn page | V4 (word count) |
| SC-012 | Auto-archive after 90 days | V3 |
| SC-013 | Provider fallback | V7 |

# Tasks: Content Expansion

**Input**: Design documents from `/specs/001-content-expansion/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested — skipped per spec.

**Organization**: Tasks grouped by user story for independent implementation. Solo creator workflow — sequential execution by priority (P1 → P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema changes and foundational utilities needed by all user stories.

- [x] T001 Add `archivedAt DateTime?` field to Post model in `prisma/schema.prisma` and run `npx prisma db push`
- [x] T002 Add `similarityOverrideReason String?` field to Post model in `prisma/schema.prisma` and run `npx prisma db push`
- [x] T003 Implement text similarity utility function in `src/lib/content-similarity.ts` — Jaccard similarity on word n-grams, returns 0.0-1.0 score
- [x] T004 Implement similarity check API endpoint `POST /api/admin/posts/similarity-check` in `src/app/api/admin/posts/similarity-check/route.ts` — accepts content string, compares against published posts, returns maxSimilarity + matches
- [x] T005 Implement auto-archive logic in `src/lib/auto-archive.ts` — checks opinion/news posts older than 90 days, sets archivedAt
- [x] T006 Add auto-archive API endpoint `GET /api/admin/posts/archive-status` in `src/app/api/admin/posts/archive-status/route.ts`
- [x] T007 Update blog listing query in `src/lib/blog.ts` to filter `archivedAt IS NULL` by default
- [x] T008 Update Post publish API `PUT /api/admin/posts/[id]/publish` in `src/app/api/admin/posts/[id]/publish/route.ts` — add similarity block logic + override reason field

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: AI Writer blog generation template and admin UI updates.

**⚠️ CRITICAL**: No user story content generation can begin until this phase is complete.

- [x] T009 Create blog content generation prompt templates per category in `src/lib/ai/prompts.ts` — 4 templates: web3-fundamentals, ai-tutorials, airdrop-guides, opinion-news
- [x] T010 Create blog generation API endpoint `POST /api/admin/ai/generate-blog` in `src/app/api/admin/ai/generate-blog/route.ts` — accepts category + topic + language, uses provider fallback, returns draft with SEO metadata
- [x] T011 Add "Blog Content" option to AI Writer admin UI in `src/app/admin/ai-writer/page.tsx` — category selector, topic input, generate button, preview panel
- [x] T012 Add similarity check UI in admin post editor — "Check Similarity" button, similarity score display, block/warning message, override reason input
- [x] T013 Add auto-archive cron endpoint `POST /api/admin/posts/auto-archive` in `src/app/api/admin/posts/auto-archive/route.ts` — triggers auto-archive check, can be called manually or via cron
- [x] T014 Add English translation step to blog publish workflow — after ID version approved, trigger translate to EN, mark needs_review, admin verifies
- [x] T015 Update admin post listing in `src/app/admin/posts/page.tsx` — show archive status, days until archive for opinion/news, override reason display

**Checkpoint**: AI Writer can generate blog drafts, similarity check works, auto-archive functional. Ready for content generation.

---

## Phase 3: User Story 1 — Web3 Fundamentals Blog Posts (Priority: P1) 🎯 MVP

**Goal**: 5 blog posts about blockchain basics, DeFi intro, NFT guide, wallet setup, gas fees — bilingual ID/EN.

**Independent Test**: Visit /blog → filter "Web3 Fundamentals" → 5 articles visible, each with ID+EN versions, SEO metadata valid, reading time 5-10 min.

### Implementation for User Story 1

- [x] T016 [US1] Generate + review + publish "Apa Itu Blockchain? Panduan Lengkap untuk Pemula" via AI Writer → save as `content/blog/web3-fundamentals/apa-itu-blockchain-panduan-pemula.mdx`
- [x] T017 [US1] Generate + review + publish "DeFi untuk Pemula: Apa Itu dan Cara Kerjanya" via AI Writer → save as `content/blog/web3-fundamentals/defi-untuk-pemula.mdx`
- [x] T018 [US1] Generate + review + publish "Panduan NFT: Dari Konsep sampai Koleksi" via AI Writer → save as `content/blog/web3-fundamentals/panduan-nft-konsep-koleksi.mdx`
- [x] T019 [US1] Generate + review + publish "Cara Setup Crypto Wallet: Step-by-Step" via AI Writer → save as `content/blog/web3-fundamentals/cara-setup-crypto-wallet.mdx`
- [x] T020 [US1] Generate + review + publish "Gas Fees: Mengapa Bayar dan Cara Hemat" via AI Writer → save as `content/blog/web3-fundamentals/gas-fees-panduan.mdx`
- [x] T021 [US1] Translate all 5 Web3 fundamentals posts to English, review translations, mark as verified

**Checkpoint**: 5 Web3 fundamentals posts published in ID + EN. Blog listing shows 5 articles in category.

---

## Phase 4: User Story 2 — AI Tutorials Blog Posts (Priority: P1)

**Goal**: 5 blog posts about prompt engineering, LLM comparison, AI tools review, ChatGPT tips, AI image generation — bilingual ID/EN.

**Independent Test**: Visit /blog → filter "AI Tutorials" → 5 articles visible with difficulty indicator, code examples render correctly, links to AI Tools Directory work.

### Implementation for User Story 2

- [x] T022 [US2] Generate + review + publish "Prompt Engineering: Seni Berbicara dengan AI" via AI Writer → save as `content/blog/ai-tutorials/prompt-engineering-seni-berbicara-ai.mdx`
- [x] T023 [US2] Generate + review + publish "Perbandingan LLM 2026: GPT vs Claude vs Gemini vs Llama" via AI Writer → save as `content/blog/ai-tutorials/perbandingan-llm-2026.mdx`
- [x] T024 [US2] Generate + review + publish "10 AI Tools Wajib Coba untuk Produktivitas" via AI Writer → save as `content/blog/ai-tutorials/10-ai-tools-produktivitas.mdx`
- [x] T025 [US2] Generate + review + publish "Tips ChatGPT: Dari Pemula ke Power User" via AI Writer → save as `content/blog/ai-tutorials/tips-chatgpt-power-user.mdx`
- [x] T026 [US2] Generate + review + publish "AI Image Generation: Dari Prompt ke Gambar" via AI Writer → save as `content/blog/ai-tutorials/ai-image-generation-panduan.mdx`
- [x] T027 [US2] Translate all 5 AI tutorials posts to English, review translations, mark as verified

**Checkpoint**: 5 AI tutorials posts published in ID + EN. Difficulty indicators visible.

---

## Phase 5: User Story 3 — Airdrop Guides Blog Posts (Priority: P2)

**Goal**: 5 blog posts about active airdrops, how to qualify, scam avoidance — bilingual ID/EN, links to Airdrop Hub.

**Independent Test**: Visit /blog → filter "Airdrop Guides" → 5 guides visible with airdrop status indicators, links to Airdrop Hub valid.

### Implementation for User Story 3

- [x] T028 [US3] Generate + review + publish "Airdrop Crypto 2026: Daftar Terbaru yang Masih Aktif" via AI Writer → save as `content/blog/airdrop-guides/airdrop-crypto-2026-daftar-terbaru.mdx`
- [x] T029 [US3] Generate + review + publish "Cara Kualifikasi Airdrop: Checklist Lengkap" via AI Writer → save as `content/blog/airdrop-guides/cara-kualifikasi-airdrop-checklist.mdx`
- [x] T030 [US3] Generate + review + publish "Menghindari Scam Airdrop: Red Flags dan Tips Aman" via AI Writer → save as `content/blog/airdrop-guides/menghindari-scam-airdrop.mdx`
- [x] T031 [US3] Generate + review + publish "Airdrop Farming Strategy: Maksimalkan Reward" via AI Writer → save as `content/blog/airdrop-guides/airdrop-farming-strategy.mdx`
- [x] T032 [US3] Generate + review + publish "Testnet Airdrop: Cara Berpartisipasi dan Dapat Token Gratis" via AI Writer → save as `content/blog/airdrop-guides/testnet-airdrop-panduan.mdx`
- [x] T033 [US3] Translate all 5 airdrop guides to English, review translations, mark as verified

**Checkpoint**: 5 airdrop guides published in ID + EN. Links to Airdrop Hub functional.

---

## Phase 6: User Story 4 — Opinion/News Blog Posts (Priority: P2)

**Goal**: 5 blog posts about Web3 trends, AI regulation, market analysis — bilingual ID/EN, auto-archive after 90 days.

**Independent Test**: Visit /blog → 5 opinion/news articles visible with published dates. Set one article's publishedAt to 91 days ago → verify auto-archive hides it from listing.

### Implementation for User Story 4

- [x] T034 [US4] Generate + review + publish "Tren Web3 2026: Apa yang Perlu Diketahui" via AI Writer → save as `content/blog/opinion-news/tren-web3-2026.mdx`
- [x] T035 [US4] Generate + review + publish "Regulasi AI di Indonesia: Dampak untuk Developer" via AI Writer → save as `content/blog/opinion-news/regulasi-ai-indonesia.mdx`
- [x] T036 [US4] Generate + review + publish "Analisis Pasar Crypto Q2 2026" via AI Writer → save as `content/blog/opinion-news/analisis-pasar-crypto-q2-2026.mdx`
- [x] T037 [US4] Generate + review + publish "AI Agents: Masa Depan atau Hype?" via AI Writer → save as `content/blog/opinion-news/ai-agents-masa-depan-atau-hype.mdx`
- [x] T038 [US4] Generate + review + publish "Indonesia dan Web3: Peluang serta Tantangan" via AI Writer → save as `content/blog/opinion-news/indonesia-web3-peluang-tantangan.mdx`
- [x] T039 [US4] Translate all 5 opinion/news posts to English, review translations, mark as verified
- [x] T040 [US4] Verify auto-archive works — set test article publishedAt to 91 days ago, run auto-archive, confirm hidden from listing but accessible via URL

**Checkpoint**: 5 opinion/news posts published in ID + EN. Auto-archive verified working.

---

## Phase 7: User Story 5 — Learn Web3 Track Expansion (Priority: P1)

**Goal**: 20+ Learn pages for Web3 track (Solidity, DeFi, DAO governance) with quizzes and flashcards.

**Independent Test**: Visit /learn/web3-basics → 20+ pages visible, progress tracking works, quiz completable, flashcards accessible.

### Implementation for User Story 5

- [x] T041 [US5] Create Learn sections in database: "Solidity Fundamentals" (8 pages), "DeFi Deep Dive" (7 pages), "DAO Governance" (7 pages) via admin API or seed script
- [x] T042 [US5] [P] Generate + save 8 Solidity pages (800-1500 kata each) via `/api/admin/learn/pages/generate` — topics: Intro to Solidity, Variables & Types, Functions, Smart Contract Structure, Events & Errors, Inheritance, Testing, Deployment
- [x] T043 [US5] [P] Generate + save 7 DeFi pages (800-1500 kata each) — topics: DeFi Architecture, AMM & DEX, Lending Protocols, Yield Farming, Liquidity Mining, Impermanent Loss, DeFi Risks
- [x] T044 [US5] [P] Generate + save 7 DAO pages (800-1500 kata each) — topics: What is DAO, Governance Tokens, Voting Mechanisms, Proposal Lifecycle, DAO Tools, Treasury Management, DAO Legal
- [x] T045 [US5] Verify all 22 Web3 pages have quiz (3+ questions) and flashcards (5+ cards)
- [x] T046 [US5] Test progress tracking — complete 5 pages, verify XP earned, progress bar updates, streak tracking works

**Checkpoint**: 22 Web3 Learn pages live with quizzes, flashcards, progress tracking functional.

---

## Phase 8: User Story 6 — Learn AI Track Expansion (Priority: P1)

**Goal**: 20+ Learn pages for AI track (LLM Integration, Fine-tuning, RAG, AI Agents) with quizzes and flashcards.

**Independent Test**: Visit /learn/ai-basics → 20+ pages visible, flashcards work, AI chat assistant responds contextually.

### Implementation for User Story 6

- [x] T047 [US6] Create Learn sections in database: "LLM Integration" (6 pages), "Fine-tuning" (5 pages), "RAG Systems" (5 pages), "AI Agents" (6 pages) via admin API or seed script
- [x] T048 [US6] [P] Generate + save 6 LLM Integration pages (800-1500 kata each) — topics: API Basics, Prompt Design, Streaming Responses, Error Handling, Rate Limiting, Multi-Provider
- [x] T049 [US6] [P] Generate + save 5 Fine-tuning pages (800-1500 kata each) — topics: When to Fine-tune, Data Preparation, Training Process, Evaluation, Deployment
- [x] T050 [US6] [P] Generate + save 5 RAG pages (800-1500 kata each) — topics: RAG Architecture, Embeddings, Vector DB, Retrieval Strategies, Production RAG
- [x] T051 [US6] [P] Generate + save 6 AI Agents pages (800-1500 kata each) — topics: Agent Architecture, Tool Use, Memory Systems, Multi-Agent, Evaluation, Safety
- [x] T052 [US6] Verify all 22 AI pages have quiz (3+ questions) and flashcards (5+ cards)
- [x] T053 [US6] Test progress tracking — complete 5 pages, verify XP earned, progress bar updates, streak tracking works

**Checkpoint**: 22 AI Learn pages live with quizzes, flashcards, progress tracking functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, SEO verification, content quality check.

- [x] T054 Run `npx prisma generate && npm run build` — verify no build errors after all content added
- [x] T055 Verify bilingual content — spot-check 3 blog posts across categories, confirm ID + EN versions readable and accurate
- [x] T056 Verify SEO metadata — check 5 random blog posts for title tag, meta description, OG image, JSON-LD in HTML source
- [x] T057 Verify blog listing — confirm 20+ posts visible, 5+ per category, reading times accurate
- [x] T058 Verify Learn tracks — confirm 20+ pages per track, quiz/flashcard counts, progress tracking across both tracks
- [x] T059 Run quickstart.md validation scenarios V1-V7 from `specs/001-content-expansion/quickstart.md`
- [x] T060 Update CHANGELOG.md with Content Expansion feature entry

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS all user stories
- **Phase 3-6 (Blog US1-US4)**: All depend on Phase 2. Can run sequentially by priority.
- **Phase 7-8 (Learn US5-US6)**: All depend on Phase 2. Can run in parallel with blog phases.
- **Phase 9 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (Web3 Fundamentals)**: Phase 2 → Generate posts → Translate → Done
- **US2 (AI Tutorials)**: Phase 2 → Generate posts → Translate → Done (independent of US1)
- **US3 (Airdrop Guides)**: Phase 2 → Generate posts → Translate → Done (independent of US1/US2)
- **US4 (Opinion/News)**: Phase 2 → Generate posts → Translate → Verify archive → Done
- **US5 (Learn Web3)**: Phase 2 → Create sections → Generate pages → Verify → Done (independent of US1-US4)
- **US6 (Learn AI)**: Phase 2 → Create sections → Generate pages → Verify → Done (independent of US1-US5)

### Parallel Opportunities

- Phase 1 tasks T001-T002 can run in parallel (different schema fields)
- Phase 1 tasks T003-T006 can run in parallel (different files)
- Blog content generation (T016-T020, T022-T026, T028-T032, T034-T038) — each is independent
- Learn page generation (T042-T044, T048-T051) — different sections, can run in parallel
- Blog phases (US1-US4) and Learn phases (US5-US6) are fully independent — can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Schema changes + similarity + auto-archive utilities
2. Complete Phase 2: AI Writer blog template + admin UI
3. Complete Phase 3: 5 Web3 fundamentals posts + translations
4. **STOP and VALIDATE**: Test V1 from quickstart.md
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → AI Writer ready for blog generation
2. US1 (Web3 Fundamentals) → 5 posts live → **MVP!**
3. US2 (AI Tutorials) → 5 more posts → 10 total
4. US5 (Learn Web3) → 22 Learn pages → retention driver
5. US6 (Learn AI) → 22 more Learn pages → 44 total
6. US3 (Airdrop Guides) → 5 more posts → 15 total
7. US4 (Opinion/News) → 5 more posts → 20 total, archive verified
8. Polish → All validation scenarios pass

### Solo Creator Strategy

Since this is a solo creator platform (Abraham Yusuf):
- Generate 1 post at a time → review → publish (per clarification)
- Estimated time: 30 min per post × 20 posts = ~10 hours for all blog content
- Learn pages can be generated in batch (admin reviews generated content)
- Spread over multiple sessions/days

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Blog content stored as MDX files in `content/blog/`, Learn pages stored in database via Prisma
- One-by-one generation workflow per clarification (no batch)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

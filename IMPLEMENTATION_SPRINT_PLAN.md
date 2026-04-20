# Web3AI Hub — Implementation Plan per Phase & Sprint

Dokumen ini memecah seluruh roadmap menjadi sprint 2-mingguan yang siap dieksekusi per tugas.

## Working Model

- Durasi sprint: **2 minggu**.
- Setiap sprint punya: **Tujuan**, **Task by Phase**, **Output**, **Definition of Done (DoD)**.
- Prioritas label:
  - **P0**: critical path launch.
  - **P1**: penting untuk kualitas/retensi/monetisasi.
  - **P2**: nice-to-have atau optimasi lanjutan.

---

## Sprint 1 — Phase 0 (Foundation Hardening)

### Tujuan
Menjadikan fondasi project siap dipakai tim untuk delivery cepat dan aman.

### Task
1. **Environment & Config (P0)**
   - Lengkapi `.env.example` untuk semua provider utama.
   - Tambah validasi env terpusat (`src/lib/env.ts`).
   - Dokumentasikan mode `dev/staging/prod` di README.
2. **Quality Gate (P0)**
   - Standarisasi script `lint`, `typecheck`, `build`, `test` di `package.json`.
   - Tambahkan pre-commit hook (lint + typecheck ringan).
   - Setup CI minimal: lint + typecheck + build.
3. **Auth Baseline (P0)**
   - Migrasi bertahap dari mock credentials ke DB user.
   - Tetapkan role matrix `admin/editor/viewer`.
   - Tambah route guard untuk area admin.
4. **Security Baseline (P1)**
   - Hardening headers dasar.
   - Pattern handling error API konsisten.

### Output
- Pipeline CI hijau.
- Dokumen setup developer siap onboarding.
- Fondasi auth lebih aman untuk phase admin berikutnya.

### DoD
- PR lint/typecheck/build pass.
- Semua env required tervalidasi saat startup.

---

## Sprint 2 — Phase 1 (Blog Core Reader Experience)

### Tujuan
Membuat pengalaman membaca blog setara website publikasi modern.

### Task
1. **Reading UX (P0)**
   - TOC otomatis dari heading MDX.
   - Reading time + word count.
   - Share button (X, Telegram, copy link).
2. **Discovery (P0)**
   - Related posts by tag/category.
   - Prev/next post navigation.
3. **SEO Baseline Blog (P1)**
   - Metadata lengkap per post (title, desc, OG/Twitter).
   - JSON-LD Article dasar.

### Output
- Halaman detail blog lebih lengkap dan shareable.

### DoD
- Semua post menampilkan TOC + reading time + related posts.

---

## Sprint 3 — Phase 1 (Blog Admin + Taxonomy)

### Tujuan
Menyelesaikan fitur blog end-to-end dari admin sampai publish.

### Task
1. **Blog Admin CRUD (P0)**
   - Halaman admin: list, create, edit, delete post.
   - Draft/publish/schedule state.
2. **Taxonomy (P0)**
   - Model category & tag final.
   - Filter route berdasarkan tag/category.
3. **Operational Content Flow (P1)**
   - Slug uniqueness checker.
   - Preview mode sebelum publish.

### Output
- Editor tidak perlu edit file manual untuk rilis artikel.

### DoD
- Admin bisa publish artikel dari dashboard secara penuh.

---

## Sprint 4 — Phase 2 (AI Writer)

### Tujuan
Memberi fitur AI writer yang stabil untuk mempercepat produksi konten.

### Task
1. **Provider Layer (P0)**
   - Abstraction provider (OpenAI/Anthropic/Google/Groq).
   - Fallback strategy jika provider gagal.
2. **AI Generation API (P0)**
   - Endpoint generate dengan streaming response.
   - Rate limit + observability dasar.
3. **Admin UX (P0)**
   - Form input topik, tone, panjang, bahasa.
   - Regenerate/copy/insert to editor.
4. **Settings & Key Management (P1)**
   - Halaman setting provider/model.
   - Simpan API key encrypted.

### Output
- Admin dapat membuat draft konten dari UI.

### DoD
- End-to-end generate → review → insert berjalan baik.

---

## Sprint 5 — Phase 3 (Monetisasi + SEO Hardening)

### Tujuan
Mempersiapkan monetisasi awal dan penguatan organic traffic.

### Task
1. **Ad Infra (P0)**
   - Komponen `AdSlot` reusable.
   - Site settings: enable/disable ads per section.
2. **Placement (P0)**
   - Posisi ads di blog, learn, dan tools listing/detail.
   - Rule: sembunyikan ads untuk admin login.
3. **SEO Hardening (P1)**
   - Canonical URL konsisten.
   - Sitemap + robots final.
   - Internal linking block antar modul.

### Output
- Platform siap monetisasi awal dengan guardrails.

### DoD
- Ads tampil sesuai placement dan rule role.

---

## Sprint 6 — Phase 4 (Learn Module Part 1)

### Tujuan
Menaikkan kualitas modul belajar jadi terstruktur dan scalable.

### Task
1. **Navigation UX (P0)**
   - Sidebar hierarchy track/section/page.
   - Breadcrumb + prev/next lesson.
2. **Data Migration (P0)**
   - Aktivasi DB-backed learn structure.
   - Migrasi bertahap dari file-only ke hybrid.
3. **Content Expansion (P1)**
   - Tambahan konten track Web3 basics + AI basics.

### Output
- Learn module lebih terstruktur untuk scale konten.

### DoD
- User dapat menavigasi lesson end-to-end dengan struktur jelas.

---

## Sprint 7 — Phase 4 (Learn Module Part 2: AI Chat + Progress)

### Tujuan
Menambah interaktivitas pembelajaran dan retensi pengguna.

### Task
1. **Contextual AI Chat (P0)**
   - Chat sidebar mengambil konteks halaman aktif.
   - Streaming jawaban + quick prompt.
2. **Progress Tracking (P0)**
   - Guest progress via localStorage.
   - User progress via DB sinkron saat login.
3. **Retention UX (P1)**
   - Continue learning card di dashboard/home.
   - Completion badge sederhana.

### Output
- Pengguna dapat lanjut belajar dari progres terakhir.

### DoD
- Progress tetap terbaca setelah refresh/login.

---

## Sprint 8 — Phase 5 (Airdrop Hub Full)

### Tujuan
Menyelesaikan Airdrop Hub agar siap jadi growth channel utama.

### Task
1. **Search & Filter (P0)**
   - Filter/sort/search server-driven penuh.
   - URL query sync untuk shareable state.
2. **Detail Experience (P0)**
   - Requirements checklist, social links, related airdrops.
   - Report issue/scam flow.
3. **Admin Operations (P1)**
   - Admin CRUD airdrop.
   - Bulk status update.
   - AI tutorial helper untuk langkah klaim.

### Output
- Modul airdrop siap untuk operasional konten harian.

### DoD
- Seluruh flow user + admin berjalan tanpa edit DB manual.

---

## Sprint 9 — Phase 6 (AI Tools Directory Full)

### Tujuan
Menjadikan direktori tools sebagai fitur pembeda + monetisasi affiliate.

### Task
1. **Compare Feature (P0)**
   - Compare 2–3 tools.
   - Shareable compare URL.
2. **Monetization Hooks (P0)**
   - Affiliate click tracking event.
   - Featured/new badge management.
3. **Admin + Data Seeding (P1)**
   - Admin CRUD tool + media.
   - Seed awal minimal 100 tools berkualitas.

### Output
- User discovery → compare → outbound click dapat diukur.

### DoD
- Tracking click affiliate tercatat dan tervalidasi.

---

## Sprint 10 — Phase 7 (Polish, QA, Launch)

### Tujuan
Membawa produk dari status MVP ke launch-ready.

### Task
1. **Global Search (P0)**
   - Search lintas blog, learn, airdrop, tools.
2. **Reliability (P0)**
   - Error boundaries + loading/skeleton states.
   - Halaman 404/500 yang jelas.
3. **Testing (P0)**
   - Unit test service core.
   - Integration test API utama.
   - E2E smoke test critical path.
4. **Analytics & Launch Ops (P1)**
   - Event analytics utama + dashboard ringkas.
   - Launch checklist (GSC/GA4/OG/social cards/content minimum).

### Output
- Build siap diluncurkan dengan quality baseline jelas.

### DoD
- Launch checklist berstatus Go.

---

## Cross-Sprint Execution Matrix

### Backend Focus (parallel stream)
- Auth, API AI writer, admin CRUD modules, analytics events.

### Frontend Focus (parallel stream)
- Reader UX blog/learn, compare UI, ads slots, global search UX.

### Content/Ops Focus (parallel stream)
- Taksonomi konten, seed data tools, kurasi airdrop, SOP publish.

---

## Dependency Order (Critical Path)

1. Foundation hardening (Sprint 1)
2. Blog end-to-end (Sprint 2–3)
3. AI writer (Sprint 4)
4. Monetisasi + SEO (Sprint 5)
5. Learn completion (Sprint 6–7)
6. Airdrop + AI Tools completion (Sprint 8–9)
7. Launch polish & QA (Sprint 10)

---

## Template Task per Sprint (siap copy ke Jira/Linear)

- **Epic**: `[Phase X] <Nama Sprint>`
- **Story**: `<Feature>`
- **Acceptance Criteria**:
  1. Given ... When ... Then ...
  2. Edge case tervalidasi.
  3. Telemetry event terkirim.
- **Checklist teknis**:
  - [ ] API
  - [ ] UI
  - [ ] Validation
  - [ ] Tests
  - [ ] Docs
- **Owner**: FE / BE / Fullstack / Content
- **Priority**: P0 / P1 / P2
- **Estimate**: 1, 2, 3, 5, 8 story points

---

## Immediate Next Actions (Minggu Ini)

1. Finalisasi scope Sprint 1 + assign owner.
2. Freeze backlog Sprint 1 agar tidak scope creep.
3. Setup board dengan kolom: Backlog → Ready → In Progress → Review → Done.
4. Tentukan ritme ritual: planning, daily, review, retro.

Dokumen ini bisa langsung dipakai sebagai baseline eksekusi phase-by-phase dan task-by-task.

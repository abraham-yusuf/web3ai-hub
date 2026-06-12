# Feature Specification: Content Expansion

**Feature Branch**: `content-expansion`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Expand blog content to 20+ posts across 4 categories (Web3 fundamentals, AI tutorials, Airdrop guides, Opinion/News) and expand Learn tracks to 20+ pages each (Web3 + AI) using AI-assisted content generation with human review."

## Clarifications

### Session 2026-06-12

- Q: Bagaimana alur kerja generasi konten — batch atau one-by-one? → A: **One-by-one** — Generate 1 draft, review, edit, publish, lanjut ke artikel berikutnya
- Q: Apa yang secara eksplisit DIKECUALIKAN dari fitur Content Expansion ini? → A: **Konten only** — Hanya blog posts + Learn pages. Exclude: plagiarism checker, cover image gen, newsletter, analytics integration
- Q: Apa yang terjadi dengan artikel opinion/news yang sudah outdated? → A: **Auto-archive** — Artikel opinion/news otomatis jadi "archived" setelah 90 hari, hidden dari listing tapi tetap accessible via URL
- Q: Ketika konten baru terdeteksi mirip dengan yang sudah ada, apa action yang diambil? → A: **Warn + block** — Block publish saat similarity > 80%, admin bisa override dengan alasan tertulis
- Q: Berapa target panjang konten per halaman Learn track? → A: **Medium (800-1500 kata)** — Balance antara depth dan readability, cocok untuk self-paced learning

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Web3 Fundamentals Blog Posts (Priority: P1)

Seorang pemula Web3 Indonesia mengunjungi AI3 untuk belajar dasar-dasar blockchain. Dia menemukan 5 artikel berkualitas tinggi tentang blockchain basics, DeFi intro, NFT guide, wallet setup, dan gas fees — semuanya dalam Bahasa Indonesia dengan penjelasan yang mudah dipahami dan relevan dengan konteks lokal.

**Why this priority**: Web3 fundamentals adalah entry point terbesar untuk traffic organik. Pencarian "apa itu blockchain", "cara pakai crypto wallet", dan "DeFi itu apa" volume pencariannya tinggi di Indonesia. Tanpa konten ini, platform kehilangan potensi visitor yang paling besar.

**Independent Test**: Dapat diuji secara independen dengan mengakses 5 artikel Web3 fundamentals, memverifikasi konten lengkap dalam ID + EN, SEO metadata valid, dan reading time wajar (5-10 menit).

**Acceptance Scenarios**:

1. **Given** pengunjung baru mengakses halaman blog, **When** memfilter kategori "Web3 Fundamentals", **Then** muncul minimal 5 artikel dengan judul, excerpt, cover image, dan reading time
2. **Given** pembaca membuka artikel Web3, **When** artikel dimuat, **Then** konten MDX render dengan sempurna termasuk custom components (callout, code-block) dan tersedia versi English
3. **Given** admin mengakses AI Writer, **When** memilih template "Web3 Fundamentals", **Then** sistem menghasilkan 1 draft artikel dengan struktur yang sesuai (intro, penjelasan konsep, contoh praktis, kesimpulan)

---

### User Story 2 - AI Tutorials Blog Posts (Priority: P1)

Seorang developer Indonesia ingin belajar AI tools dan teknik. Dia menemukan 5 tutorial praktis tentang prompt engineering, perbandingan LLM, review AI tools, tips ChatGPT, dan AI image generation — dengan contoh kode dan use case nyata.

**Why this priority**: AI tutorials menarik audience developer dan tech enthusiast yang merupakan core user base AI3. Konten ini juga mendukung promosi silang ke AI Tools Directory yang sudah ada.

**Independent Test**: Dapat diuji dengan mengakses 5 artikel AI tutorials, memverifikasi konten teknis akurat, ada code examples, dan link ke AI Tools Directory yang relevan.

**Acceptance Scenarios**:

1. **Given** developer mencari tutorial AI di platform, **When** mengakses kategori "AI Tutorials", **Then** muncul minimal 5 artikel dengan difficulty indicator (beginner/intermediate/advanced)
2. **Given** pembaca mengikuti tutorial prompt engineering, **When** menyalin contoh prompt, **Then** contoh prompt ter-render dengan code block yang rapi dan ada tombol copy
3. **Given** artikel review AI tools dipublish, **When** pembaca mengklik nama tool, **Then** diarahkan ke halaman detail tool di AI Tools Directory

---

### User Story 3 - Airdrop Guides Blog Posts (Priority: P2)

Seorang crypto enthusiast mencari panduan airdrop terbaru. Dia menemukan 5 guide yang mencakup airdrop aktif saat ini, cara kualifikasi, dan cara menghindari scam — dengan langkah-langkah praktis dan link ke Airdrop Hub.

**Why this priority**: Airdrop guides mendukung Airdrop Hub yang sudah ada dan menarik traffic dari pencarian "airdrop crypto terbaru", "cara claim airdrop", dan sejenisnya. Priority P2 karena Airdrop Hub sudah berjalan, konten ini adalah pelengkap.

**Independent Test**: Dapat diuji dengan mengakses 5 airdrop guide articles, memverifikasi link ke Airdrop Hub valid, dan steps akurat.

**Acceptance Scenarios**:

1. **Given** pengguna mencari panduan airdrop, **When** mengakses kategori "Airdrop Guides", **Then** muncul minimal 5 guide dengan status airdrop indicator (active/upcoming/ended)
2. **Given** guide menampilkan langkah claim airdrop, **When** pembaca mengikuti steps, **Then** setiap step ada numbering jelas dan link langsung ke halaman airdrop di Airdrop Hub
3. **Given** guide tentang scam avoidance, **When** pembaca selesai membaca, **Then** ada CTA ke halaman airdrop yang sudah di-review dan memiliki risk score

---

### User Story 4 - Opinion/News Blog Posts (Priority: P2)

Seorang pembaca rutin AI3 ingin update tren Web3 dan AI. Dia menemukan 5 artikel opinion/news tentang tren Web3, regulasi AI, dan analisis pasar — dengan perspektif lokal Indonesia.

**Why this priority**: Opinion/news content membangun authority dan credibility platform. Juga mendukung SEO untuk keyword berita yang trending. P2 karena konten ini memerlukan riset lebih dalam dan relevansi waktu.

**Independent Test**: Dapat diuji dengan mengakses 5 opinion/news articles, memverifikasi published date recent, dan konten relevan dengan tren saat ini.

**Acceptance Scenarios**:

1. **Given** pembaca mengakses halaman blog, **When** melihat artikel terbaru, **Then** muncul minimal 5 artikel opinion/news dengan published date dan estimated reading time
2. **Given** artikel membahas tren pasar, **When** pembaca selesai membaca, **Then** ada related articles section yang menampilkan artikel terkait dari kategori lain
3. **Given** artikel opinion dipublish lebih dari 90 hari yang lalu, **When** pengunjung mengakses halaman blog, **Then** artikel tersebut tidak muncul di listing utama tapi tetap accessible via URL langsung
4. **Given** artikel opinion dipublish, **When** di-share ke social media, **Then** OG image dan metadata ter-render dengan sempurna termasuk author info

---

### User Story 5 - Learn Web3 Track Expansion (Priority: P1)

Seorang learner yang sudah menyelesaikan dasar-dasar Web3 ingin mendalami Solidity, DeFi deep-dive, dan DAO governance. Dia menemukan 20+ halaman baru di Learn Web3 track dengan progress tracking dan quiz.

**Why this priority**: Learn track adalah fitur retention utama platform. Track yang lengkap (20+ halaman) membuat user kembali lagi dan menyelesaikan seluruh learning path. Ini juga mendukung gamification system (XP, streak, achievements).

**Independent Test**: Dapat diuji dengan mengakses Learn Web3 track, memverifikasi minimal 20 halaman tersedia, progress tracking berfungsi, dan quiz dapat diselesaikan.

**Acceptance Scenarios**:

1. **Given** learner mengakses Learn Web3 track, **When** halaman dimuat, **Then** terlihat minimal 20 halaman yang ter-organize dalam sections (Solidity, DeFi, DAO, dll)
2. **Given** learner menyelesaikan satu halaman, **When** menekan tombol "Mark Complete", **Then** progress bar update dan XP bertambah sesuai reward yang ditetapkan
3. **Given** learner menyelesaikan section, **When** quiz tersedia, **Then** learner dapat mengerjakan quiz dan mendapat feedback langsung
4. **Given** learner membuka halaman Learn, **When** konten dimuat, **Then** panjang konten 800-1500 kata per halaman dengan struktur yang jelas

---

### User Story 6 - Learn AI Track Expansion (Priority: P1)

Seorang developer AI ingin belajar LLM integration, fine-tuning, dan RAG. Dia menemukan 20+ halaman baru di Learn AI track dengan interactive examples dan flashcards.

**Why this priority**: Sama dengan Web3 track — Learn AI track adalah retention driver. Konten AI juga lebih unik dibanding Web3 (kurang kompetitor di Indonesia) dan mendukung positioning AI3 sebagai platform AI education.

**Independent Test**: Dapat diuji dengan mengakses Learn AI track, memverifikasi minimal 20 halaman, flashcards berfungsi, dan interactive examples dapat dijalankan.

**Acceptance Scenarios**:

1. **Given** learner mengakses Learn AI track, **When** halaman dimuat, **Then** terlihat minimal 20 halaman dalam sections (LLM Integration, Fine-tuning, RAG, AI Agents)
2. **Given** learner membaca halaman tentang RAG, **When** selesai membaca, **Then** tersedia flashcards untuk review dan quiz untuk test pemahaman
3. **Given** learner menggunakan AI chat assistant, **When** bertanya tentang materi yang sedang dipelajari, **Then** assistant memberikan jawaban kontekstual berdasarkan halaman yang sedang aktif
4. **Given** learner membuka halaman Learn, **When** konten dimuat, **Then** panjang konten 800-1500 kata per halaman dengan struktur yang jelas

---

### Edge Cases

- Apa yang terjadi jika AI Writer menghasilkan draft yang tidak akurat secara teknis? → Draft masuk status PENDING_REVIEW, admin wajib review sebelum publish. Admin reject → regenerate dengan prompt yang di-adjust
- Bagaimana jika konten bilingual (ID/EN) memiliki perbedaan makna setelah terjemahan? → AI translation perlu human verification, ada flag "needs_review" pada versi English
- Apa yang terjadi jika 20+ halaman Learn track terlalu banyak untuk satu sesi? → Progress tracking menyimpan state, learner bisa lanjut kapan saja
- Bagaimana jika konten blog yang di-generate mirip dengan konten yang sudah ada? → System block publish saat similarity > 80%, admin bisa override dengan alasan tertulis
- Apa yang terjadi jika Learn track content di-generate tapi quiz belum siap? → Halaman bisa dipublish tanpa quiz, quiz ditambahkan belakangan
- Apa yang terjadi jika admin generate draft tapi AI provider down? → Fallback ke provider lain (existing provider abstraction), jika semua down → simpan draft sebagai "pending_generation" dan retry nanti
- Apa yang terjadi jika artikel opinion/news sudah lebih dari 90 hari? → Otomatis archived, hidden dari listing utama, tetap accessible via URL langsung untuk SEO value
- Bagaimana jika admin ingin publish konten yang mirip (>80%) dengan alasan yang valid (misal series artikel)? → Admin bisa override block dengan menulis alasan, system log override reason

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST mampu menghasilkan 1 draft artikel blog per waktu melalui AI Writer dengan struktur yang konsisten (intro, body sections, conclusion, CTA)
- **FR-002**: System MUST mendukung 4 kategori blog: Web3 Fundamentals, AI Tutorials, Airdrop Guides, Opinion/News
- **FR-003**: Setiap artikel blog MUST memiliki versi Indonesian (default) dan English
- **FR-004**: System MUST menghasilkan SEO metadata otomatis untuk setiap artikel (title tag, meta description, OG image, JSON-LD)
- **FR-005**: Admin MUST dapat mereview, mengedit, dan approve draft sebelum publish
- **FR-006**: System MUST menghasilkan minimal 5 artikel per kategori (20 total), satu per satu dengan review per artikel
- **FR-007**: Learn track Web3 MUST memiliki minimal 20 halaman baru yang ter-organize dalam sections (Solidity, DeFi, DAO governance)
- **FR-008**: Learn track AI MUST memiliki minimal 20 halaman baru yang ter-organize dalam sections (LLM Integration, Fine-tuning, RAG, AI Agents)
- **FR-009**: Setiap halaman Learn MUST mendukung progress tracking (mark as complete)
- **FR-010**: Setiap section Learn MUST memiliki quiz yang relevan dengan materi
- **FR-011**: System MUST menghasilkan flashcards untuk setiap halaman Learn
- **FR-012**: Konten blog MUST menggunakan MDX dengan custom components (callout, code-block, comparison, youtube-embed)
- **FR-013**: System MUST menghitung reading time dan word count untuk setiap artikel
- **FR-014**: Admin MUST dapat menjadwalkan publish (scheduled publishing) untuk artikel per item
- **FR-015**: System MUST mendeteksi konten yang mirip (>80% similarity) dengan artikel yang sudah ada dan BLOCK publish, admin bisa override dengan alasan tertulis
- **FR-016**: System MUST auto-archive artikel opinion/news setelah 90 hari (hidden dari listing, accessible via URL)
- **FR-017**: Setiap halaman Learn MUST memiliki konten 800-1500 kata per halaman
- **FR-018**: Jika AI provider utama down, system MUST fallback ke provider lain untuk generasi konten
- **FR-019**: Ffitur ini TIDAK mencakup: plagiarism checker, cover image generation, newsletter integration, analytics integration

### Key Entities

- **Post**: Artikel blog dengan title, slug, content (MDX), excerpt, coverImage, category, tags, language, status (DRAFT/PENDING_REVIEW/PUBLISHED/ARCHIVED), scheduledFor, readingTime, wordCount, publishedAt, archivedAt
- **LearnTrack**: Learning path (Web3/AI) dengan sections dan pages
- **LearnSection**: Kelompok halaman dalam track, dengan order dan title
- **LearnPage**: Halaman individual dengan content (MDX), order, quiz reference, wordCount (target 800-1500)
- **Quiz**: Kumpulan pertanyaan per halaman/section dengan questions JSON
- **Flashcard**: Kartu belajar per halaman dengan front (pertanyaan) dan back (jawaban)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Blog section memiliki minimal 20 artikel published yang tersebar merata di 4 kategori (min 5 per kategori)
- **SC-002**: Learn Web3 track memiliki minimal 20 halaman yang dapat diselesaikan oleh learner dengan progress tracking berfungsi
- **SC-003**: Learn AI track memiliki minimal 20 halaman yang dapat diselesaikan oleh learner dengan progress tracking berfungsi
- **SC-004**: Setiap artikel blog memiliki versi ID dan EN yang keduanya readable dan akurat
- **SC-005**: 95% konten yang di-generate oleh AI Writer lolos human review tanpa perubahan mayor (> 80% konten di-approve)
- **SC-006**: Rata-rata waktu dari draft ke publish (termasuk review) tidak lebih dari 30 menit per artikel
- **SC-007**: Setiap halaman Learn memiliki minimal 1 quiz dengan 3 pertanyaan dan minimal 5 flashcards
- **SC-008**: SEO metadata untuk semua 20+ artikel valid dan ter-verifikasi (title, description, OG image, JSON-LD)
- **SC-009**: Tidak ada artikel yang dipublish dengan konten duplikat atau sangat mirip (> 80% similarity) dengan artikel yang sudah ada, kecuali admin override dengan alasan
- **SC-010**: Semua konten Learn track dapat diakses dan selesai tanpa error dalam satu sesi learning
- **SC-011**: Setiap halaman Learn memiliki konten 800-1500 kata
- **SC-012**: Artikel opinion/news yang berusia > 90 hari otomatis archived dan tidak muncul di listing utama
- **SC-013**: Content generation berhasil fallback ke provider alternatif jika provider utama down (tanpa intervensi manual)

## Assumptions

- AI Writer yang sudah ada (OpenAI, Anthropic, Google, Groq) memiliki kapasitas untuk menghasilkan 20+ artikel secara one-by-one tanpa rate limiting yang signifikan
- Admin (Abraham Yusuf) memiliki waktu untuk mereview dan approve setiap draft sebelum publish
- Platform deployment (Vercel) tidak memiliki batasan build time yang mempengaruhi publish individual
- Neon PostgreSQL memiliki kapasitas untuk menyimpan 20+ post baru + 40+ Learn pages + quiz + flashcards
- MDX pipeline yang sudah ada mendukung semua custom components yang dibutuhkan untuk konten baru
- Cloudflare R2 storage tersedia untuk cover images dan media assets (existing)
- Konten Web3 dan AI yang di-generate akurat secara teknis dan tidak outdated dalam 6 bulan
- Sistem i18n yang sudah ada (id/en) mendukung routing dan konten bilingual untuk semua konten baru
- Plagiarism checker, cover image generation, newsletter, dan analytics adalah fitur terpisah di luar scope ini
- Auto-archive hanya berlaku untuk kategori Opinion/News, kategori lain (fundamentals, tutorials, guides) bersifat evergreen

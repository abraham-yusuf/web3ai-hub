# 🤝 Contributing to AI3 / Web3AI Hub

Terima kasih atas minat Anda untuk berkontribusi! Platform ini dibangun untuk komunitas Web3 & AI di Indonesia dan Asia Tenggara.

---

## 📋 Daftar Isi

- [Code of Conduct](#code-of-conduct)
- [Cara Berkontribusi](#cara-berkontribusi)
- [Setup Development](#setup-development)
- [Struktur Proyek](#struktur-proyek)
- [Konvensi Kode](#konvensi-kode)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Menambah Konten](#menambah-konten)

---

## Code of Conduct

- Hormati semua kontributor
- Bahasa yang inklusif dan profesional
- Fokus pada teknis, bukan personal
- Report bug, jangan exploit

---

## Cara Berkontribusi

### 🐛 Bug Report

1. Buka [Issues](https://github.com/abraham-yusuf/web3ai-hub/issues)
2. Cek apakah bug sudah dilaporkan
3. Buat issue baru dengan template:
   - **Judul**: Deskripsi singkat bug
   - **Langkah reproduksi**: Steps to reproduce
   - **Expected behavior**: Yang seharusnya terjadi
   - **Actual behavior**: Yang terjadi
   - **Environment**: OS, browser, Node version
   - **Screenshot/Logs**: Jika ada

### 💡 Feature Request

1. Buka issue baru dengan label `enhancement`
2. Jelaskan masalah yang ingin dipecahkan
3. Sarankan solusi jika ada
4. Cek [TODO.md](./TODO.md) apakah sudah tercatat

### 📝 Kontribusi Konten

Konten (blog post, tutorial, dokumentasi) sangat berharga! Lihat [Menambah Konten](#menambah-konten) di bawah.

---

## Setup Development

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** (lokal atau [Neon](https://neon.tech) gratis)
- **Git**

### Langkah-langkah

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/web3ai-hub.git
cd web3ai-hub

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local — isi DATABASE_URL, NEXTAUTH_SECRET, dan minimal 1 AI provider key

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. (Opsional) Seed data
npm run db:seed

# 6. Jalankan development server
npm run dev
```

Buka http://localhost:3000

### Login Admin

Default credentials (hanya untuk development):
- Email: `admin@web3aihub.com`
- Password: `admin12345`

> ⚠️ **Jangan gunakan default password di production!**

---

## Struktur Proyek

```
web3ai-hub/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (public)/         # Route group halaman publik
│   │   │   ├── blog/         # Blog listing & detail
│   │   │   ├── learn/        # Dokumentasi & tutorial
│   │   │   ├── airdrop/      # Airdrop hub
│   │   │   ├── ai-tools/     # AI tools directory
│   │   │   └── research/     # AI research assistant
│   │   ├── admin/            # Dashboard admin (protected)
│   │   └── api/              # API routes
│   │       ├── admin/        # Admin API (auth required)
│   │       ├── airdrop/      # Public airdrop API
│   │       ├── learn/        # Public learn API
│   │       └── research/     # Public research API
│   │
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── blog/             # Blog-specific components
│   │   ├── learn/            # Learn module components
│   │   ├── airdrop/          # Airdrop components
│   │   ├── mdx/              # Custom MDX components
│   │   └── layout/           # Navigation, footer, shell
│   │
│   ├── lib/                  # Utilities & helpers
│   │   ├── ai/               # AI providers, prompts, rate-limit
│   │   ├── mdx.ts            # MDX parsing
│   │   ├── posts.ts          # Blog post helpers
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── rate-limiter.ts   # Generic rate limiter
│   │   ├── audit-log.ts      # Audit logging
│   │   ├── api-response.ts   # Standardized API responses
│   │   └── utils.ts          # General utilities
│   │
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── auth.ts               # NextAuth configuration
│
├── prisma/
│   └── schema.prisma         # Database schema
│
├── content/                  # MDX content files
│   ├── blog/                 # Blog posts (.mdx)
│   └── learn/                # Learn tracks (.mdx)
│
├── docs/                     # Project documentation
│   ├── PRD.md                # Product requirements
│   ├── ROADMAP.md            # Development roadmap
│   └── BRAND_IDENTITY.md     # Branding guidelines
│
├── public/                   # Static assets
├── tests/                    # Test files
├── TODO.md                   # Active task tracker
└── package.json
```

---

## Konvensi Kode

### TypeScript

- Gunakan **TypeScript** untuk semua file baru
- Hindari `any` — gunakan type yang spesifik
- Gunakan `interface` untuk object shapes, `type` untuk unions/intersections
- Export type terpisah: `export type { MyType }`

### React / Next.js

- Gunakan **functional components** dengan hooks
- Server Components sebagai default, `"use client"` hanya bila perlu
- Gunakan `async/await`, bukan `.then()`
- Named exports untuk components, default export untuk page routes

### Styling

- **Tailwind CSS** — gunakan utility classes
- **shadcn/ui** — gunakan komponen yang sudah ada
- Hindari inline styles
- Responsive-first: mobile → desktop

### Naming

| Jenis | Konvensi | Contoh |
|-------|----------|--------|
| File (component) | kebab-case + `.tsx` | `share-buttons.tsx` |
| File (lib) | kebab-case + `.ts` | `rate-limiter.ts` |
| Component | PascalCase | `ShareButtons` |
| Hook | camelCase, prefix `use` | `useAirdropFilters` |
| Constant | UPPER_SNAKE_CASE | `RATE_LIMIT_TIERS` |
| Database model | PascalCase | `AirdropRiskScore` |
| API route | kebab-case | `/api/airdrop/risk-score` |

---

## Commit Messages

Ikuti [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Penggunaan |
|------|-----------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `docs` | Perubahan dokumentasi |
| `style` | Formatting, whitespace (no code change) |
| `refactor` | Refactor tanpa perubahan fitur/fix |
| `perf` | Performance improvement |
| `test` | Menambah/memperbaiki test |
| `chore` | Maintenance, config, tooling |
| `ci` | CI/CD changes |

### Contoh

```
feat(airdrop): add risk scoring panel with AI analysis
fix(blog): resolve TOC anchor offset on mobile
docs: update CONTRIBUTING.md with coding standards
test(ai): add unit tests for provider fallback logic
refactor(auth): extract password hashing to auth-utils
```

---

## Pull Request Process

1. **Branch**: Buat branch dari `main`
   ```bash
   git checkout -b feature/nama-fitur
   ```

2. **Develop**: Kerjakan perubahan

3. **Quality Check**: Pastikan semua lolos
   ```bash
   npm run typecheck    # TypeScript check
   npm run lint         # ESLint
   npm run test         # Tests
   npm run build        # Build check
   ```

4. **Commit**: Gunakan conventional commits

5. **Push & PR**
   ```bash
   git push origin feature/nama-fitur
   ```
   - Beri judul PR yang jelas
   - Jelaskan perubahan di description
   - Link ke issue jika ada (e.g., `Fixes #42`)

6. **Review**: Tunggu review, lakukan perubahan jika diminta

7. **Merge**: Squash merge ke `main`

### PR Checklist

- [ ] Code lolos `npm run typecheck`
- [ ] Code lolos `npm run lint`
- [ ] Tests pass `npm run test`
- [ ] Build sukses `npm run build`
- [ ] Tidak ada secret/credential di code
- [ ] Breaking changes didokumentasi
- [ ] Commit messages mengikuti konvensi

---

## Menambah Konten

### Blog Post (MDX)

Buat file baru di `content/blog/`:

```mdx
---
title: "Judul Artikel"
slug: "slug-artikel"
category: "Web3"
tags: ["blockchain", "tutorial"]
excerpt: "Deskripsi singkat artikel"
author: "username"
language: "id"
---

Konten artikel di sini...

## Subjudul

Paragraph...
```

### Learn Content (MDX)

Buat file baru di `content/learn/<track>/`:

```mdx
---
title: "Judul Lesson"
order: 5
estimatedTime: "15 minutes"
milestone: "Foundation"
---

Konten lesson di sini...
```

---

## 📞 Kontak & Resources

- **Issues**: [github.com/abraham-yusuf/web3ai-hub/issues](https://github.com/abraham-yusuf/web3ai-hub/issues)
- **Discussions**: [github.com/abraham-yusuf/web3ai-hub/discussions](https://github.com/abraham-yusuf/web3ai-hub/discussions)
- **Website**: [ai3.web.id](https://ai3.web.id)

---

*Dibuat dengan ❤️ untuk komunitas Web3 & AI Indonesia*

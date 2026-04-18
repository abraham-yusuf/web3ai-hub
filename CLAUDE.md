# CLAUDE.md — Panduan untuk AI Development Assistant

> File ini adalah konteks utama untuk AI coding assistant (Claude, Cursor, Copilot, dll) yang membantu mengembangkan **Web3AI Hub**. Baca file ini sebelum melakukan perubahan apapun pada codebase.

---

## 🎯 Tentang Proyek Ini

**Web3AI Hub** adalah platform konten Next.js dengan fitur: blog MDX, dokumentasi interaktif, airdrop hub, dan AI tools directory. Dibangun untuk kreator konten solo di bidang Web3 & AI, dengan monetisasi via Google AdSense dan affiliate links.

**Bahasa**: Indonesia (konten) + English (kode dan komentar teknikal)  
**Stack utama**: Next.js App Router · TypeScript · Tailwind CSS · Prisma · Vercel AI SDK

---

## 🏗️ Arsitektur & Keputusan Teknis Penting

### App Router First
Proyek ini **seluruhnya menggunakan App Router** (bukan Pages Router). Jangan pernah membuat file di `/pages/`. Semua route ada di `/app/`.

```
app/
├── (public)/          # Route group untuk halaman publik (tidak mempengaruhi URL)
│   ├── blog/
│   ├── learn/
│   ├── airdrop/
│   └── ai-tools/
├── admin/             # Protected routes — hanya admin
│   ├── posts/
│   ├── settings/
│   └── ...
└── api/               # API routes
```

### Server vs Client Components
- **Default: Server Component** — jangan tambahkan `'use client'` kecuali benar-benar perlu
- Gunakan Client Component untuk: interaktivitas (onClick, onChange), hooks (useState, useEffect), browser APIs
- Pisahkan komponen besar menjadi server + client yang kecil
- Data fetching dilakukan di Server Component, bukan Client Component

```typescript
// ✅ BENAR — Server Component fetch data
// app/blog/page.tsx
async function BlogPage() {
  const posts = await getPosts() // langsung fetch, tanpa useEffect
  return <PostGrid posts={posts} />
}

// ✅ BENAR — Client Component hanya untuk interaktivitas
'use client'
function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>...</button>
}
```

### Route Handlers (API)
Semua API ada di `app/api/`. Gunakan `Route Handlers`, bukan `pages/api/`.

```typescript
// app/api/ai/generate/route.ts
export async function POST(request: Request) {
  const { topic, provider } = await request.json()
  // ...
}
```

### Data Fetching Strategy
| Jenis Data | Strategi |
|------------|---------|
| Blog posts (MDX files) | `generateStaticParams` + ISR (`revalidate: 3600`) |
| Airdrop listings | ISR (`revalidate: 1800`) |
| AI tools | ISR (`revalidate: 86400`) |
| Learn docs | `generateStaticParams` + ISR (`revalidate: 7200`) |
| Admin data | Dynamic (no cache), server-side |
| User-specific data | Client-side dengan TanStack Query |

---

## 📁 Konvensi File & Folder

### Naming Conventions
```
components/blog/PostCard.tsx      # PascalCase untuk komponen
lib/mdx/parser.ts                 # camelCase untuk utilities
app/blog/[slug]/page.tsx          # lowercase untuk route files
hooks/useAirdropProgress.ts       # camelCase dengan prefix 'use'
stores/aiSettingsStore.ts         # camelCase dengan suffix 'Store'
types/blog.ts                     # camelCase untuk type files
```

### Komponen Structure
```typescript
// Urutan yang konsisten dalam setiap komponen:
// 1. Imports
// 2. Types/interfaces (jika file-scoped)
// 3. Constants (jika diperlukan)
// 4. Component function
// 5. Export default

import { type FC } from 'react'
import { cn } from '@/lib/utils'

interface PostCardProps {
  title: string
  slug: string
  excerpt: string
  publishedAt: Date
  category: string
}

export function PostCard({ title, slug, excerpt, publishedAt, category }: PostCardProps) {
  return (
    // JSX
  )
}
```

### Path Aliases
Selalu gunakan `@/` untuk import internal:
```typescript
import { getPosts } from '@/lib/mdx/posts'      // ✅
import { getPosts } from '../../lib/mdx/posts'   // ❌
```

---

## 🗄️ Database (Prisma)

### Schema Utama

```prisma
// prisma/schema.prisma

model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text  // MDX content
  excerpt     String?
  coverImage  String?
  published   Boolean  @default(false)
  featured    Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  tags        Tag[]
  views       Int      @default(0)
}

model Airdrop {
  id               String        @id @default(cuid())
  name             String
  slug             String        @unique
  description      String        @db.Text
  logo             String?
  network          String        // "ethereum" | "solana" | "bsc" | dll
  status           AirdropStatus @default(UPCOMING)
  estimatedReward  String?       // e.g. "$50-500"
  difficulty       Difficulty    @default(MEDIUM)
  deadline         DateTime?
  tutorial         String        @db.Text  // MDX content
  requirements     Json          // array of requirements
  socialLinks      Json          // {twitter, discord, website}
  featured         Boolean       @default(false)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model AiTool {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  tagline     String
  description String   @db.Text  // MDX
  logo        String?
  website     String
  affiliateUrl String?
  pricing     Pricing  @default(FREEMIUM)
  categoryId  String
  category    ToolCategory @relation(fields: [categoryId], references: [id])
  featured    Boolean  @default(false)
  rating      Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AiProviderConfig {
  id           String  @id @default(cuid())
  provider     String  @unique  // "openai" | "anthropic" | "google" | "groq"
  apiKey       String           // encrypted
  model        String
  temperature  Float   @default(0.7)
  maxTokens    Int     @default(2000)
  systemPrompt String? @db.Text
  enabled      Boolean @default(false)
  isDefault    Boolean @default(false)
}

enum AirdropStatus { ACTIVE UPCOMING ENDED }
enum Difficulty    { EASY MEDIUM HARD }
enum Pricing       { FREE FREEMIUM PAID }
```

### Prisma Best Practices
```typescript
// lib/db/prisma.ts — singleton pattern
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

```typescript
// ✅ Selalu include relasi yang dibutuhkan sekaligus (hindari N+1)
const posts = await prisma.post.findMany({
  include: { category: true, tags: true },
  where: { published: true },
  orderBy: { publishedAt: 'desc' },
})

// ✅ Select hanya field yang dibutuhkan
const slugs = await prisma.post.findMany({
  select: { slug: true },
  where: { published: true },
})
```

---

## 🤖 AI Integration

### Provider Abstraction Layer

```typescript
// lib/ai/providers.ts
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai' // untuk Groq

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'groq'

export function getAIModel(provider: AIProvider, modelId: string) {
  switch (provider) {
    case 'openai':    return openai(modelId)
    case 'anthropic': return anthropic(modelId)
    case 'google':    return google(modelId)
    case 'groq':
      const groq = createOpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY })
      return groq(modelId)
    default:
      throw new Error(`Provider tidak dikenal: ${provider}`)
  }
}
```

### AI Route Handler Pattern
```typescript
// app/api/ai/generate/route.ts
import { streamText } from 'ai'
import { getAIModel } from '@/lib/ai/providers'
import { getBlogWriterPrompt } from '@/lib/ai/prompts'
import { getDefaultAIConfig } from '@/lib/db/ai-config'

export async function POST(request: Request) {
  const { topic, tone, length, language } = await request.json()
  
  const config = await getDefaultAIConfig('blog_writer')
  const model = getAIModel(config.provider, config.model)
  
  const result = await streamText({
    model,
    system: config.systemPrompt ?? getBlogWriterPrompt({ language }),
    prompt: `Tulis artikel tentang: ${topic}. Tone: ${tone}. Panjang: ${length}.`,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  })
  
  return result.toDataStreamResponse()
}
```

### Rate Limiting
Semua AI endpoints harus ada rate limiting:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req per menit per IP
})
```

### API Key Security
- API keys TIDAK BOLEH tersimpan di plain text di database
- Gunakan enkripsi AES-256 sebelum menyimpan ke DB
- Library: `crypto-js` atau Node.js built-in `crypto`
- Decrypt hanya di server-side saat hendak digunakan

```typescript
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes hex string

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedHex] = encryptedText.split(':')
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(ivHex, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()])
  return decrypted.toString()
}
```

---

## 📝 MDX Pipeline

### Frontmatter Schema (Blog Post)
```typescript
// types/blog.ts
export interface BlogFrontmatter {
  title: string
  date: string              // ISO 8601: "2025-01-15"
  author: string
  category: string          // slug kategori
  tags: string[]            // array slug tags
  excerpt: string           // 1-2 kalimat untuk meta description
  coverImage: string        // path relatif dari /public: "/images/blog/..."
  published: boolean
  featured?: boolean
  readingTime?: number      // auto-generated, override opsional
}
```

### MDX Custom Components
```typescript
// components/mdx/MDXComponents.tsx
// Komponen ini di-inject ke semua halaman MDX

export const mdxComponents = {
  // Override elemen HTML default
  h2: (props: any) => <h2 className="scroll-mt-20 ..." {...props} />,
  pre: CodeBlock,
  img: ImageCaption,
  
  // Custom components (dipakai di .mdx files)
  Callout,        // <Callout type="warning">...</Callout>
  YoutubeEmbed,   // <YoutubeEmbed id="dQw4w9WgXcQ" />
  Comparison,     // <Comparison items={[...]} />
  Steps,          // <Steps><Step>...</Step></Steps>
  AdSlot,         // <AdSlot slot="blog-inline" />
}
```

### File Naming Convention (content/)
```
content/blog/                        
├── belajar-solidity-pemula.mdx      # kebab-case, bahasa Indonesia OK
├── top-10-ai-tools-2025.mdx
└── defi-explained.mdx

content/learn/web3/
├── 01-blockchain-basics/
│   ├── _meta.json                   # urutan dan metadata section
│   ├── 01-apa-itu-blockchain.mdx
│   └── 02-cara-kerja-blockchain.mdx
└── 02-ethereum/
    ├── _meta.json
    └── 01-pengenalan-ethereum.mdx
```

---

## 🎨 Styling Guidelines

### Tailwind Class Ordering
Gunakan `prettier-plugin-tailwindcss` untuk auto-sort. Urutan manual:
1. Layout (display, position, flex, grid)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (font, text)
5. Visual (background, border, shadow)
6. Interactive (hover, focus, transition)

### Component Pattern
```tsx
// ✅ Gunakan cn() untuk conditional classes
import { cn } from '@/lib/utils' // shadcn/ui utility

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  variant === 'primary' && 'primary-class',
  className  // always accept className prop untuk extensibility
)}>
```

### Dark Mode
Proyek ini menggunakan class-based dark mode (`dark:` prefix). Selalu sediakan variant dark:
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

### Responsiveness
Selalu mobile-first:
```tsx
// ✅ Mobile first
<div className="flex flex-col md:flex-row">
  <aside className="w-full md:w-64">

// ❌ Jangan desktop first
<div className="flex flex-row md:flex-col">
```

---

## 🔐 Auth & Authorization

### NextAuth.js Setup
```typescript
// auth.ts (root level)
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // hanya admin — tidak ada public registration
      authorize: async (credentials) => {
        // verify against DB
      }
    })
  ],
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user
      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      if (isAdminRoute) return isLoggedIn
      return true
    }
  }
})
```

### Protected Routes
Semua route di `/admin/**` otomatis protected via middleware:
```typescript
// middleware.ts
export { auth as middleware } from '@/auth'

export const config = {
  matcher: ['/admin/:path*']
}
```

---

## 📊 Error Handling

### API Route Errors
```typescript
// Selalu gunakan pola ini di API routes
try {
  // logic
  return Response.json({ data })
} catch (error) {
  console.error('[API_ROUTE_NAME]', error)
  
  if (error instanceof ZodError) {
    return Response.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 })
  }
  
  return Response.json({ error: 'Server error' }, { status: 500 })
}
```

### AI Error Handling
```typescript
// Tangani error AI dengan pesan yang user-friendly
try {
  const result = await streamText({ ... })
  return result.toDataStreamResponse()
} catch (error: any) {
  if (error.message?.includes('API key')) {
    return Response.json({ error: 'API key tidak valid. Periksa pengaturan AI provider.' }, { status: 401 })
  }
  if (error.message?.includes('rate limit')) {
    return Response.json({ error: 'Batas request tercapai. Coba lagi dalam beberapa menit.' }, { status: 429 })
  }
  return Response.json({ error: 'AI provider sedang bermasalah. Coba provider lain.' }, { status: 500 })
}
```

---

## 🚫 Hal yang TIDAK BOLEH Dilakukan

1. **Jangan gunakan `any` type di TypeScript** — gunakan `unknown` atau type yang tepat
2. **Jangan fetch data di Client Component** dengan `useEffect + fetch` — gunakan Server Component atau TanStack Query
3. **Jangan hardcode API keys** di kode apapun
4. **Jangan gunakan `pages/` directory** — hanya App Router
5. **Jangan lupa `'use client'`** pada komponen yang menggunakan hooks atau event handlers
6. **Jangan render AdSense di server** — `AdSlot.tsx` harus Client Component dengan `useEffect`
7. **Jangan expose AI provider config** ke client-side bundle
8. **Jangan lupa `alt` pada semua `<img>` dan `<Image>`**
9. **Jangan buat API route tanpa rate limiting** untuk endpoint AI
10. **Jangan simpan API key plaintext** di database

---

## ✅ Checklist Sebelum Commit

- [ ] TypeScript: `npm run type-check` → 0 errors
- [ ] Lint: `npm run lint` → 0 errors, 0 warnings
- [ ] Komponen baru: ada proper typing, tidak ada `any`
- [ ] API route baru: ada error handling dan validasi input
- [ ] Halaman baru: ada proper metadata (`generateMetadata`)
- [ ] Fitur yang bisa di-cache: ada `revalidate` yang tepat
- [ ] Dark mode: semua elemen baru punya `dark:` variant
- [ ] Mobile: semua elemen baru responsive di 375px

---

## 🔧 Development Workflow

### Branch Convention
```
main           — production
develop        — staging / integration
feature/xxx    — fitur baru
fix/xxx        — bug fix
content/xxx    — penambahan konten saja
```

### Commit Message Convention (Conventional Commits)
```
feat: tambah AI writer dengan streaming
fix: perbaiki MDX frontmatter parsing
content: tambah 5 airdrop guides baru
style: update warna primary ke violet-600
refactor: pisah AI provider ke file terpisah
perf: optimasi query Prisma di blog listing
docs: update README dengan instruksi deploy
chore: upgrade Next.js ke 14.2
```

### Cara Menambah Post Blog Baru
```bash
# Via CLI script
npm run content:new -- --type blog --title "Judul Post" --category web3

# Atau manual: buat file di content/blog/
# Format: kebab-case-dari-judul.mdx
```

---

## 📦 Dependensi Kunci & Versi

```json
{
  "next": "latest",
  "react": "^18.3.0",
  "typescript": "^5.4.0",
  "tailwindcss": "^3.4.0",
  "@prisma/client": "^5.13.0",
  "ai": "^3.1.0",
  "@ai-sdk/openai": "^0.0.43",
  "@ai-sdk/anthropic": "^0.0.39",
  "next-auth": "^5.0.0-beta",
  "next-mdx-remote": "^5.0.0",
  "gray-matter": "^4.0.3",
  "framer-motion": "^11.2.0",
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.40.0",
  "zod": "^3.23.0",
  "lucide-react": "^0.400.0"
}
```

---

## 💬 Konteks untuk AI Assistant

Ketika membantu di proyek ini, tolong:

1. **Selalu gunakan TypeScript** — tidak ada JavaScript murni
2. **Ikuti pola yang ada** — lihat file serupa sebelum membuat yang baru
3. **Berpikir dalam App Router** — tidak ada `getServerSideProps`, `getStaticProps`
4. **Pertimbangkan performa** — apakah ini perlu di-cache? ISR atau dynamic?
5. **Mobile-first** — selalu cek tampilan di 375px
6. **Konsisten dengan naming** — ikuti konvensi yang sudah ada
7. **Dokumentasi inline** — tambahkan JSDoc untuk fungsi publik yang kompleks
8. **Error messages dalam Bahasa Indonesia** untuk UI, English untuk console/logs

Jika ada pertanyaan tentang arsitektur atau keputusan teknis, rujuk ke dokumen ini, `PRD.md`, dan `ROADMAP.md`.

---

*File ini diupdate setiap kali ada keputusan arsitektur baru atau perubahan konvensi.*

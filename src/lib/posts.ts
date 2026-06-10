import { prisma } from "@/lib/prisma"
import { getFileBySlug, getAllFilesMetadata } from "@/lib/mdx"

export interface BlogPostData {
  id?: string
  slug: string
  title: string
  excerpt?: string
  content: string
  category?: string
  tags: string[]
  author?: string
  authors?: string[]
  published: boolean
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  scheduledFor?: string
  source: "db" | "mdx"
}

function parseTags(rawTags: string): string[] {
  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function parseTagsInput(raw: string | null): string[] {
  return parseTags(raw ?? "")
}

function normalizePost(post: BlogPostData): BlogPostData {
  const authors = post.authors ?? (post.author ? [ensureSlug(post.author)] : [])
  return {
    ...post,
    tags: post.tags ?? [],
    excerpt: post.excerpt ?? "",
    category: post.category ?? "General",
    authors,
  }
}

export async function getDbPosts(options?: { publishedOnly?: boolean; locale?: "EN" | "ID" | null }) {
  try {
    const now = new Date()
    const whereClause = options?.publishedOnly
      ? {
          published: true,
          OR: [{ scheduledFor: null }, { scheduledFor: { lte: now } }],
        }
      : undefined

    // Add locale filter if provided
    const where = options?.locale
      ? { ...whereClause, language: options.locale }
      : whereClause

    const posts = await prisma.post.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: {
        author: {
          select: { name: true, email: true, username: true },
        },
      },
    })

    return posts.map((post) =>
      normalizePost({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content,
        category: post.category,
        tags: post.tags,
        author: post.author.name ?? (post.author.username ? `@${post.author.username}` : post.author.email) ?? "Admin",
        authors: post.author.username
          ? [post.author.username]
          : post.author.email
            ? [post.author.email.split("@")[0] ?? ""].filter(Boolean)
            : [],
        published: post.published,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        publishedAt: post.publishedAt?.toISOString(),
        scheduledFor: post.scheduledFor?.toISOString(),
        source: "db",
      }),
    )
  } catch {
    return []
  }
}

function getMdxPosts(): BlogPostData[] {
  const metadata = getAllFilesMetadata("blog")

  return metadata
    .filter((post) => post.published !== false)
    .map((post) =>
      normalizePost({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: getFileBySlug("blog", post.slug)?.content ?? "",
        category: post.category,
        tags: post.tags ?? [],
        author: post.author,
        authors: post.authors ?? (post.author ? [ensureSlug(post.author)] : []),
        published: true,
        createdAt: post.date,
        source: "mdx",
      }),
    )
}

export async function getPublicBlogPosts(locale?: "EN" | "ID" | null): Promise<BlogPostData[]> {
  const dbPosts = await getDbPosts({ publishedOnly: true, locale })
  const mdxPosts = getMdxPosts()

  const merged = [...dbPosts]
  for (const mdxPost of mdxPosts) {
    if (!merged.some((post) => post.slug === mdxPost.slug)) {
      merged.push(mdxPost)
    }
  }

  return merged.sort((a, b) => {
    const aTime = a.publishedAt ?? a.createdAt ?? ""
    const bTime = b.publishedAt ?? b.createdAt ?? ""
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })
}

export async function getPublicBlogPostBySlug(slug: string): Promise<BlogPostData | null> {
  const dbPosts = await getDbPosts({ publishedOnly: true })
  const dbPost = dbPosts.find((post) => post.slug === slug)
  if (dbPost) return dbPost

  const mdxPost = getFileBySlug("blog", slug)
  if (!mdxPost || mdxPost.frontMatter.published === false) return null

  return normalizePost({
    slug,
    title: mdxPost.frontMatter.title,
    excerpt: mdxPost.frontMatter.excerpt,
    content: mdxPost.content,
    category: mdxPost.frontMatter.category,
    tags: mdxPost.frontMatter.tags ?? [],
    author: mdxPost.frontMatter.author,
    authors: mdxPost.frontMatter.authors ?? (mdxPost.frontMatter.author ? [ensureSlug(mdxPost.frontMatter.author)] : []),
    published: true,
    createdAt: mdxPost.frontMatter.date,
    source: "mdx",
  })
}

export async function getBlogTaxonomies() {
  const posts = await getPublicBlogPosts()

  const categories = Array.from(new Set(posts.map((post) => post.category ?? "General"))).sort()
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()

  return { categories, tags }
}

export function ensureSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
}

export async function getPostTranslationByLocale(
  postId: string,
  targetLocale: "EN" | "ID"
): Promise<{ id: string; slug: string; title: string } | null> {
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) return null

    const currentLocale = post.language === "EN" ? "EN" : "ID"

    // If already in target locale, return null (no translation needed)
    if (currentLocale === targetLocale) return null

    let translated: { id: string; slug: string; title: string } | null = null

    if (targetLocale === "EN" && post.englishVersion) {
      // Find the English version by slug
      const englishPost = await prisma.post.findUnique({
        where: { slug: post.englishVersion },
        select: { id: true, slug: true, title: true },
      })
      translated = englishPost
    } else if (targetLocale === "ID" && currentLocale === "EN") {
      // Find Indonesian version - look for post where englishVersion equals current post's slug
      const indonesianPost = await prisma.post.findFirst({
        where: { englishVersion: post.slug, language: "ID" },
        select: { id: true, slug: true, title: true },
      })
      translated = indonesianPost
    }

    return translated
  } catch {
    return null
  }
}

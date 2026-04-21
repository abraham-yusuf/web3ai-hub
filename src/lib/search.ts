import { prisma } from "@/lib/prisma"
import { getPublicBlogPosts } from "@/lib/posts"
import { getLearnNavigation, getLearnPageBySlug } from "@/lib/learn"

export type SearchType = "blog" | "learn" | "airdrop" | "tool"

export interface SearchResultItem {
  id: string
  type: SearchType
  title: string
  excerpt: string
  href: string
  category?: string
}

const TYPE_LABELS: Record<SearchType, string> = {
  blog: "Blog",
  learn: "Learn",
  airdrop: "Airdrop",
  tool: "AI Tool",
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
}

function scoreMatch(title: string, excerpt: string, query: string): number {
  if (!query.trim()) return 1

  const q = normalizeText(query)
  const titleText = normalizeText(title)
  const excerptText = normalizeText(excerpt)

  let score = 0
  if (titleText.includes(q)) score += 5
  if (titleText.startsWith(q)) score += 2
  if (excerptText.includes(q)) score += 2

  const tokens = q.split(/\s+/).filter(Boolean)
  for (const token of tokens) {
    if (titleText.includes(token)) score += 2
    if (excerptText.includes(token)) score += 1
  }

  return score
}

function toExcerpt(content?: string | null, fallback = ""): string {
  const raw = (content ?? fallback).replace(/[#*_`]/g, " ").replace(/\s+/g, " ").trim()
  return raw.slice(0, 180)
}

export async function searchContent(query: string, filter: SearchType | "all" = "all"): Promise<SearchResultItem[]> {
  const [blogPosts, learnNav, airdrops, tools] = await Promise.all([
    filter === "all" || filter === "blog" ? getPublicBlogPosts() : Promise.resolve([]),
    filter === "all" || filter === "learn" ? getLearnNavigation() : Promise.resolve([]),
    filter === "all" || filter === "airdrop"
      ? prisma.airdrop.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            network: true,
            content: true,
          },
        })
      : Promise.resolve([]),
    filter === "all" || filter === "tool"
      ? prisma.aITool.findMany({
          orderBy: { rating: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
          },
        })
      : Promise.resolve([]),
  ])

  const blogItems: SearchResultItem[] = blogPosts.map((post) => ({
    id: `blog-${post.slug}`,
    type: "blog",
    title: post.title,
    excerpt: toExcerpt(post.excerpt, post.content),
    href: `/blog/${post.slug}`,
    category: post.category,
  }))

  const learnSlugs = learnNav.flatMap((track) =>
    track.sections.flatMap((section) => section.pages.map((page) => page.slug)),
  )

  const learnPages = filter === "all" || filter === "learn" ? await Promise.all(learnSlugs.map((slug) => getLearnPageBySlug(slug))) : []

  const learnItems: SearchResultItem[] = learnPages
    .filter((page): page is NonNullable<typeof page> => Boolean(page))
    .map((page) => ({
      id: `learn-${page.slug}`,
      type: "learn",
      title: page.title,
      excerpt: toExcerpt(page.excerpt, page.content),
      href: `/learn/${page.slug}`,
      category: page.trackTitle,
    }))

  const airdropItems: SearchResultItem[] = airdrops.map((airdrop) => ({
    id: `airdrop-${airdrop.id}`,
    type: "airdrop",
    title: airdrop.name,
    excerpt: toExcerpt(airdrop.content),
    href: `/airdrop/${airdrop.slug}`,
    category: airdrop.network,
  }))

  const toolItems: SearchResultItem[] = tools.map((tool) => ({
    id: `tool-${tool.id}`,
    type: "tool",
    title: tool.name,
    excerpt: toExcerpt(tool.description),
    href: `/ai-tools/${tool.slug}`,
    category: tool.category,
  }))

  return [...blogItems, ...learnItems, ...airdropItems, ...toolItems]
    .map((item) => ({
      item,
      score: scoreMatch(item.title, item.excerpt, query),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
    .map(({ item }) => item)
}

export function getSearchTypeLabel(type: SearchType): string {
  return TYPE_LABELS[type]
}

import { getAllFilesMetadata } from "@/lib/mdx"
import type { PostMetadata } from "@/lib/mdx"

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

export interface ReadingStats {
  words: number
  minutes: number
}

function stripMdxSyntax(content: string): string {
  return content
    .replace(/^---[\s\S]*?---/g, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[>#*_~\-]/g, " ")
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
}

export function extractToc(content: string): TocItem[] {
  const lines = content.split("\n")
  const items: TocItem[] = []

  for (const line of lines) {
    const headingMatch = /^(##|###)\s+(.+)$/.exec(line.trim())
    if (!headingMatch) {
      continue
    }

    const level = headingMatch[1] === "##" ? 2 : 3
    const text = headingMatch[2].replace(/[#*_`]/g, "").trim()

    items.push({
      id: slugifyHeading(text),
      text,
      level,
    })
  }

  return items
}

export function getReadingStats(content: string): ReadingStats {
  const plainText = stripMdxSyntax(content)
  const words = plainText.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))

  return {
    words,
    minutes,
  }
}

export function getPublishedBlogPosts(): PostMetadata[] {
  const now = new Date()
  const ARCHIVE_DAYS = 90

  return getAllFilesMetadata("blog")
    .filter((post) => {
      if (post.published === false) return false

      // Auto-archive opinion/news posts older than 90 days
      if (post.category === "opinion-news" && post.date) {
        const publishedDate = new Date(post.date)
        const daysSincePublished = Math.floor(
          (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSincePublished > ARCHIVE_DAYS) return false
      }

      return true
    })
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0
      const bTime = b.date ? new Date(b.date).getTime() : 0
      return bTime - aTime
    })
}

function getScore(currentPost: PostMetadata, candidate: PostMetadata): number {
  let score = 0

  if (currentPost.category && currentPost.category === candidate.category) {
    score += 2
  }

  const currentTags = currentPost.tags ?? []
  const candidateTags = candidate.tags ?? []
  const sharedTagCount = currentTags.filter((tag) => candidateTags.includes(tag)).length
  score += sharedTagCount * 3

  return score
}

export function getRelatedPosts(currentPost: PostMetadata, limit = 3): PostMetadata[] {
  return getPublishedBlogPosts()
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => ({
      post,
      score: getScore(currentPost, post),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.post)
}

export function getPrevNextPosts(currentSlug: string): {
  prevPost: PostMetadata | null
  nextPost: PostMetadata | null
} {
  const posts = getPublishedBlogPosts()
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug)

  if (currentIndex === -1) {
    return {
      prevPost: null,
      nextPost: null,
    }
  }

  return {
    prevPost: posts[currentIndex + 1] ?? null,
    nextPost: posts[currentIndex - 1] ?? null,
  }
}

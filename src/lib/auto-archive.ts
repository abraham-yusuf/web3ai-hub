/**
 * Auto-archive logic for opinion/news articles.
 * Articles in the "opinion-news" category are automatically archived
 * after 90 days from publish date.
 */

import { prisma } from "@/lib/prisma"

const ARCHIVE_DAYS = 90

/**
 * Find and archive opinion/news posts older than 90 days.
 * Returns the count of newly archived posts.
 */
export async function autoArchiveOpinionNews(): Promise<{
  archived: number;
  posts: Array<{ id: string; slug: string; title: string; publishedAt: Date | null }>;
}> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_DAYS)

  // Find opinion/news posts that are published, older than 90 days, and not yet archived
  const postsToArchive = await prisma.post.findMany({
    where: {
      category: "opinion-news",
      status: "PUBLISHED",
      published: true,
      archivedAt: null,
      publishedAt: {
        not: null,
        lt: cutoffDate,
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      publishedAt: true,
    },
  })

  if (postsToArchive.length === 0) {
    return { archived: 0, posts: [] }
  }

  // Batch update to archived
  const now = new Date()
  await prisma.post.updateMany({
    where: {
      id: { in: postsToArchive.map(p => p.id) },
    },
    data: {
      archivedAt: now,
    },
  })

  return {
    archived: postsToArchive.length,
    posts: postsToArchive,
  }
}

/**
 * Get archive status for opinion/news articles.
 */
export async function getArchiveStatus(): Promise<{
  totalOpinionNews: number;
  archived: number;
  archivingSoon: Array<{
    slug: string;
    title: string;
    publishedAt: Date | null;
    daysUntilArchive: number;
  }>;
}> {
  const now = new Date()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_DAYS)
  const soonDate = new Date()
  soonDate.setDate(soonDate.getDate() - (ARCHIVE_DAYS - 30)) // 30 days before archive

  const [totalOpinionNews, archived, archivingSoon] = await Promise.all([
    prisma.post.count({
      where: { category: "opinion-news", status: "PUBLISHED", published: true },
    }),
    prisma.post.count({
      where: { category: "opinion-news", archivedAt: { not: null } },
    }),
    prisma.post.findMany({
      where: {
        category: "opinion-news",
        status: "PUBLISHED",
        published: true,
        archivedAt: null,
        publishedAt: {
          not: null,
          lt: soonDate,
          gte: cutoffDate,
        },
      },
      select: {
        slug: true,
        title: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "asc" },
    }),
  ])

  return {
    totalOpinionNews,
    archived,
    archivingSoon: archivingSoon.map(p => ({
      slug: p.slug,
      title: p.title,
      publishedAt: p.publishedAt,
      daysUntilArchive: p.publishedAt
        ? Math.max(0, Math.ceil((cutoffDate.getTime() - p.publishedAt.getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
    })),
  }
}

import { prisma } from "@/lib/prisma"
import { getFileBySlug, getLearnStructure } from "@/lib/mdx"

export type LearnNavPage = {
  title: string
  slug: string
  order: number
}

export type LearnNavSection = {
  title: string
  order: number
  pages: LearnNavPage[]
}

export type LearnNavTrack = {
  title: string
  slug: string
  order: number
  sections: LearnNavSection[]
}

export type LearnPageResult = {
  title: string
  slug: string
  content: string
  excerpt?: string
  trackTitle?: string
  sectionTitle?: string
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export async function getLearnNavigation(): Promise<LearnNavTrack[]> {
  const dbTracks = await prisma.learnTrack.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      sections: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          pages: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            select: { title: true, slug: true, order: true },
          },
        },
      },
    },
  })

  const hasDbContent = dbTracks.some((track) => track.sections.some((section) => section.pages.length > 0))

  if (hasDbContent) {
    return dbTracks.map((track) => ({
      title: track.title,
      slug: track.slug,
      order: track.order,
      sections: track.sections.map((section) => ({
        title: section.title,
        order: section.order,
        pages: section.pages.map((page) => ({
          title: page.title,
          slug: page.slug,
          order: page.order,
        })),
      })),
    }))
  }

  const fileTracks = getLearnStructure()

  return fileTracks.map((track, index) => ({
    title: track.title,
    slug: track.slug,
    order: index,
    sections: [
      {
        title: "Lessons",
        order: 0,
        pages: track.pages.map((page) => ({
          title: page.title,
          slug: page.slug.replace(/^learn\//, ""),
          order: page.order,
        })),
      },
    ],
  }))
}

export async function getLearnPageBySlug(slugPath: string): Promise<LearnPageResult | null> {
  const dbPage = await prisma.learnPage.findUnique({
    where: { slug: slugPath },
    include: {
      section: {
        include: {
          track: true,
        },
      },
    },
  })

  if (dbPage) {
    return {
      title: dbPage.title,
      slug: dbPage.slug,
      content: dbPage.content,
      trackTitle: dbPage.section.track.title,
      sectionTitle: dbPage.section.title,
    }
  }

  const filePage = getFileBySlug("learn", slugPath)
  if (!filePage) return null

  const [trackSlug] = slugPath.split("/")

  return {
    title: filePage.frontMatter.title,
    slug: slugPath,
    content: filePage.content,
    excerpt: filePage.frontMatter.excerpt,
    trackTitle: titleFromSlug(trackSlug ?? "learn"),
    sectionTitle: "Lessons",
  }
}

export async function getLearnPagination(slugPath: string): Promise<{ prev: LearnNavPage | null; next: LearnNavPage | null }> {
  const nav = await getLearnNavigation()
  const flatPages = nav.flatMap((track) => track.sections.flatMap((section) => section.pages))
  const currentIndex = flatPages.findIndex((page) => page.slug === slugPath)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: flatPages[currentIndex - 1] ?? null,
    next: flatPages[currentIndex + 1] ?? null,
  }
}

import type { MetadataRoute } from "next"
import { getAllFilesMetadata } from "@/lib/mdx"
import { getPublicBlogPosts } from "@/lib/posts"
import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"

const baseUrl = env.NEXT_PUBLIC_APP_URL ?? env.NEXTAUTH_URL ?? "https://ai3.my.id"

// Define alternate URLs for hreflang
interface AlternateUrl {
  url: string
  language: string
}

function buildAlternateUrls(path: string): AlternateUrl[] {
  return [
    { url: `${baseUrl}${path}`, language: "id-ID" },
    { url: `${baseUrl}/en${path}`, language: "en-US" },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getPublicBlogPosts()
  const learnPages = getAllFilesMetadata("learn")

  const [toolsResult, airdropsResult, topicsResult] = await Promise.allSettled([
    prisma.aITool.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.airdrop.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.topicCluster.findMany({ select: { slug: true, updatedAt: true } }),
  ])

  if (toolsResult.status === "rejected") {
    console.error("[sitemap] Failed to load AI tools from database.", toolsResult.reason)
  }
  if (airdropsResult.status === "rejected") {
    console.error("[sitemap] Failed to load airdrops from database.", airdropsResult.reason)
  }
  if (topicsResult.status === "rejected") {
    console.error("[sitemap] Failed to load topic clusters from database.", topicsResult.reason)
  }

  const tools = toolsResult.status === "fulfilled" ? toolsResult.value : []
  const airdrops = airdropsResult.status === "fulfilled" ? airdropsResult.value : []
  const topics = topicsResult.status === "fulfilled" ? topicsResult.value : []

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/blog", priority: 0.9 },
    { path: "/learn", priority: 0.9 },
    { path: "/airdrop", priority: 0.9 },
    { path: "/ai-tools", priority: 0.9 },
    { path: "/research", priority: 0.8 },
    { path: "/topics", priority: 0.8 },
    { path: "/search", priority: 0.7 },
    { path: "/learn/roadmaps", priority: 0.8 },
    { path: "/glossary", priority: 0.8 },
    { path: "/faq", priority: 0.8 },
  ].map(({ path, priority }) => {
    const alternates = buildAlternateUrls(path)
    return {
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(alternates.map(({ url, language }) => [language, url])),
      },
    }
  })

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const postUrl = `${baseUrl}/blog/${post.slug}`
    // Build hreflang based on post language (if available)
    const postData = post as { language?: string; englishVersion?: string }
    const languageAlternates: Record<string, string> = {
      "id-ID": postUrl,
    }
    // If post has an English version, add en-US hreflang
    if (postData.language === "en") {
      languageAlternates["en-US"] = `${baseUrl}/en/blog/${post.slug}`
    } else if (postData.englishVersion) {
      languageAlternates["en-US"] = `${baseUrl}/en/blog/${postData.englishVersion}`
    }

    return {
      url: postUrl,
      lastModified: new Date(post.updatedAt ?? post.createdAt ?? new Date().toISOString()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: languageAlternates,
      },
    }
  })

  const learnRoutes: MetadataRoute.Sitemap = learnPages.map((page) => {
    const pageUrl = `${baseUrl}/${page.slug}`
    return {
      url: pageUrl,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
      alternates: {
        languages: {
          "id-ID": pageUrl,
          "en-US": `${baseUrl}/en/${page.slug}`,
        },
      },
    }
  })

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/ai-tools/${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.75,
    alternates: {
      languages: {
        "id-ID": `${baseUrl}/ai-tools/${tool.slug}`,
        "en-US": `${baseUrl}/en/ai-tools/${tool.slug}`,
      },
    },
  }))

  const airdropRoutes: MetadataRoute.Sitemap = airdrops.map((airdrop) => ({
    url: `${baseUrl}/airdrop/${airdrop.slug}`,
    lastModified: airdrop.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
    alternates: {
      languages: {
        "id-ID": `${baseUrl}/airdrop/${airdrop.slug}`,
        "en-US": `${baseUrl}/en/airdrop/${airdrop.slug}`,
      },
    },
  }))

  const topicRoutes: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${baseUrl}/topics/${topic.slug}`,
    lastModified: topic.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        "id-ID": `${baseUrl}/topics/${topic.slug}`,
        "en-US": `${baseUrl}/en/topics/${topic.slug}`,
      },
    },
  }))

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...learnRoutes,
    ...toolRoutes,
    ...airdropRoutes,
    ...topicRoutes,
  ]
}

export const dynamic = "force-static"
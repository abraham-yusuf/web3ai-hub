import type { MetadataRoute } from "next"
import { getAllFilesMetadata } from "@/lib/mdx"
import { getPublicBlogPosts } from "@/lib/posts"
import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"

const baseUrl = env.NEXT_PUBLIC_APP_URL ?? env.NEXTAUTH_URL ?? "https://ai3.my.id"

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
  ].map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }))

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.createdAt ?? new Date().toISOString()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const learnRoutes: MetadataRoute.Sitemap = learnPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }))

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/ai-tools/${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }))

  const airdropRoutes: MetadataRoute.Sitemap = airdrops.map((airdrop) => ({
    url: `${baseUrl}/airdrop/${airdrop.slug}`,
    lastModified: airdrop.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  const topicRoutes: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${baseUrl}/topics/${topic.slug}`,
    lastModified: topic.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
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
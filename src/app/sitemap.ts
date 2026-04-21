import type { MetadataRoute } from "next"
import { getAllFilesMetadata } from "@/lib/mdx"
import { getPublicBlogPosts } from "@/lib/posts"
import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"

const baseUrl = env.NEXTAUTH_URL ?? "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, learnPages, tools, airdrops] = await Promise.all([
    getPublicBlogPosts(),
    Promise.resolve(getAllFilesMetadata("learn")),
    prisma.aITool.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.airdrop.findMany({ select: { slug: true, updatedAt: true } }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = ["", "/blog", "/learn", "/airdrop", "/ai-tools"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }))

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.createdAt ?? new Date().toISOString()),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const learnRoutes: MetadataRoute.Sitemap = learnPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/ai-tools/${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }))


  const airdropRoutes: MetadataRoute.Sitemap = airdrops.map((airdrop) => ({
    url: `${baseUrl}/airdrop/${airdrop.slug}`,
    lastModified: airdrop.updatedAt,
    changeFrequency: "daily",
    priority: 0.75,
  }))

  return [...staticRoutes, ...blogRoutes, ...learnRoutes, ...toolRoutes, ...airdropRoutes]
}

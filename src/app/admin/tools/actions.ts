"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { auditLog } from "@/lib/audit-log"

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function createToolAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = getString(formData, "name")
  const slug = toSlug(getString(formData, "slug") || name)

  const tool = await prisma.aITool.create({
    data: {
      name,
      slug,
      tagline: getString(formData, "tagline") || null,
      description: getString(formData, "description") || "No description",
      category: getString(formData, "category") || "General",
      pricing: getString(formData, "pricing") || "Freemium",
      rating: Number(getString(formData, "rating") || 0),
      affiliateLink: getString(formData, "affiliateLink") || null,
      featured: formData.get("featured") === "on",
      sponsored: formData.get("sponsored") === "on",
      sponsoredUntil: getString(formData, "sponsoredUntil") ? new Date(getString(formData, "sponsoredUntil")) : null,
      sponsoredPackage: getString(formData, "sponsoredPackage") || null,
      sponsoredNote: getString(formData, "sponsoredNote") || null,
    },
  })

  await auditLog("tool.create", session.user.email ?? session.user.name ?? "unknown", "Tool", {
    actorId: session.user.id,
    resourceId: tool.id,
    details: { name, slug },
  })

  revalidatePath("/ai-tools")
  revalidatePath("/admin/tools")
  redirect("/admin/tools")
}

export async function updateToolAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const name = getString(formData, "name")
  const slug = toSlug(getString(formData, "slug") || name)

  await prisma.aITool.update({
    where: { id },
    data: {
      name,
      slug,
      tagline: getString(formData, "tagline") || null,
      description: getString(formData, "description") || "No description",
      category: getString(formData, "category") || "General",
      pricing: getString(formData, "pricing") || "Freemium",
      rating: Number(getString(formData, "rating") || 0),
      affiliateLink: getString(formData, "affiliateLink") || null,
      featured: formData.get("featured") === "on",
      sponsored: formData.get("sponsored") === "on",
      sponsoredUntil: getString(formData, "sponsoredUntil") ? new Date(getString(formData, "sponsoredUntil")) : null,
      sponsoredPackage: getString(formData, "sponsoredPackage") || null,
      sponsoredNote: getString(formData, "sponsoredNote") || null,
    },
  })

  await auditLog("tool.update", session.user.email ?? session.user.name ?? "unknown", "Tool", {
    actorId: session.user.id,
    resourceId: id,
    details: { name, slug },
  })

  revalidatePath("/ai-tools")
  revalidatePath(`/ai-tools/${slug}`)
  revalidatePath("/admin/tools")
  redirect("/admin/tools")
}

export async function deleteToolAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const tool = await prisma.aITool.findUnique({ where: { id }, select: { name: true, slug: true } })
  await prisma.aITool.delete({ where: { id } })

  await auditLog("tool.delete", session.user.email ?? session.user.name ?? "unknown", "Tool", {
    actorId: session.user.id,
    resourceId: id,
    details: { name: tool?.name, slug: tool?.slug },
  })

  revalidatePath("/ai-tools")
  revalidatePath("/admin/tools")
}

export type ImportedToolData = {
  name: string
  slug: string
  tagline?: string | null
  description?: string | null
  pricing?: string
  category?: string
  websiteUrl?: string | null
  affiliateUrl?: string | null
  logo?: string | null
}

function toSlugFromName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/**
 * Fetch tool metadata from a URL by parsing OpenGraph and meta tags.
 * Returns partial data on failure.
 */
export async function importToolFromUrlAction(url: string): Promise<ImportedToolData | { error: string }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Web3AI-Hub-Importer/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return { error: `HTTP ${response.status}: ${response.statusText}` }
    }

    const html = await response.text()

    const getMeta = (property: string): string | null => {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i"),
        new RegExp(`<meta[^>]+name=["']${property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i"),
      ]
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) return decodeHTMLEntities(match[1])
      }
      return null
    }

    const getTitle = (): string => {
      const ogTitle = getMeta("og:title")
      if (ogTitle) return ogTitle
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) return decodeHTMLEntities(titleMatch[1].trim())
      return ""
    }

    const name = getTitle() || new URL(url).hostname.replace(/^www\./, "")
    const tagline = getMeta("og:description") || getMeta("description") || null
    const description = getMeta("og:description") || getMeta("description") || "No description"
    const logo = getMeta("og:image") || null

    return {
      name,
      slug: toSlugFromName(name),
      tagline,
      description,
      pricing: "Freemium",
      category: "General",
      websiteUrl: url,
      affiliateUrl: null,
      logo,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { error: message }
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
}

export type BulkImportResult = {
  success: number
  errors: Array<{ index: number; name: string; error: string }>
}

export async function bulkImportToolsAction(
  tools: Array<{
    name: string
    slug?: string
    tagline?: string
    description?: string
    pricing?: string
    category?: string
    websiteUrl?: string
    affiliateUrl?: string
  }>
): Promise<BulkImportResult> {
  const result: BulkImportResult = { success: 0, errors: [] }

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i]
    const slug = toSlugFromName(tool.slug || tool.name)

    try {
      await prisma.aITool.upsert({
        where: { slug },
        create: {
          name: tool.name,
          slug,
          tagline: tool.tagline || null,
          description: tool.description || "No description",
          category: tool.category || "General",
          pricing: tool.pricing || "Freemium",
          rating: 0,
          affiliateLink: tool.affiliateUrl || null,
          featured: false,
        },
        update: {
          name: tool.name,
          tagline: tool.tagline || null,
          description: tool.description || "No description",
          category: tool.category || "General",
          pricing: tool.pricing || "Freemium",
          affiliateLink: tool.affiliateUrl || null,
        },
      })
      result.success++
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      result.errors.push({ index: i, name: tool.name, error: message })
    }
  }

  revalidatePath("/ai-tools")
  revalidatePath("/admin/tools")

  return result
}

// === Sponsored Tools Management Actions ===

export async function toggleSponsoredAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const tool = await prisma.aITool.findUnique({ where: { id }, select: { sponsored: true, name: true, slug: true } })
  if (!tool) throw new Error("Tool not found")

  await prisma.aITool.update({
    where: { id },
    data: { sponsored: !tool.sponsored },
  })

  await auditLog(
    tool.sponsored ? "tool.unsponsored" : "tool.sponsored",
    session.user.email ?? session.user.name ?? "unknown",
    "Tool",
    { actorId: session.user.id, resourceId: id, details: { name: tool.name, slug: tool.slug } },
  )

  revalidatePath("/ai-tools")
  revalidatePath("/admin/tools")
  revalidatePath("/admin/tools/sponsored")
}

export async function updateSponsoredDetailsAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const sponsoredPackage = getString(formData, "sponsoredPackage") || null
  const sponsoredNote = getString(formData, "sponsoredNote") || null
  const sponsoredUntilStr = getString(formData, "sponsoredUntil")
  const sponsoredUntil = sponsoredUntilStr ? new Date(sponsoredUntilStr) : null

  await prisma.aITool.update({
    where: { id },
    data: {
      sponsored: true,
      sponsoredPackage,
      sponsoredNote,
      sponsoredUntil,
    },
  })

  await auditLog("tool.sponsored.update", session.user.email ?? session.user.name ?? "unknown", "Tool", {
    actorId: session.user.id,
    resourceId: id,
    details: { sponsoredPackage, sponsoredUntil: sponsoredUntil?.toISOString() },
  })

  revalidatePath("/ai-tools")
  revalidatePath("/admin/tools/sponsored")
}

export async function expireSponsoredToolsAction() {
  const now = new Date()
  const expired = await prisma.aITool.updateMany({
    where: {
      sponsored: true,
      sponsoredUntil: { lte: now },
    },
    data: { sponsored: false },
  })

  if (expired.count > 0) {
    revalidatePath("/ai-tools")
    revalidatePath("/admin/tools/sponsored")
  }

  return { expired: expired.count }
}

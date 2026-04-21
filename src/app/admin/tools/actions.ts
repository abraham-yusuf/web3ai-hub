"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

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
  const name = getString(formData, "name")
  const slug = toSlug(getString(formData, "slug") || name)

  await prisma.aITool.create({
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
    },
  })

  revalidatePath("/ai-tools")
  revalidatePath("/admin/tools")
  redirect("/admin/tools")
}

export async function updateToolAction(formData: FormData) {
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
    },
  })

  revalidatePath("/ai-tools")
  revalidatePath(`/ai-tools/${slug}`)
  revalidatePath("/admin/tools")
  redirect("/admin/tools")
}

export async function deleteToolAction(formData: FormData) {
  const id = getString(formData, "id")
  await prisma.aITool.delete({ where: { id } })

  revalidatePath("/ai-tools")
  revalidatePath("/admin/tools")
}

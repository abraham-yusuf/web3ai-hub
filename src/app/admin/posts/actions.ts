"use server"

import { prisma } from "@/lib/prisma"
import { ensureSlug, parseTagsInput } from "@/lib/posts"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function getOptionalDate(formData: FormData, key: string): Date | null {
  const value = getString(formData, key)
  if (!value) return null

  // Treat input as Asia/Jakarta (WIB)
  // Input from datetime-local is YYYY-MM-DDTHH:mm
  const wibValue = value.includes("T") ? `${value}:00.000+07:00` : value
  const parsed = new Date(wibValue)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function createPostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const title = getString(formData, "title")
  const slugInput = getString(formData, "slug")
  const content = getString(formData, "content")
  const excerpt = getString(formData, "excerpt")
  const category = getString(formData, "category") || "General"
  const tags = parseTagsInput(formData.get("tags")?.toString() ?? "")
  const published = formData.get("published") === "on"
  const scheduledFor = getOptionalDate(formData, "scheduledFor")

  const slug = ensureSlug(slugInput || title)

  const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  if (existing) {
    throw new Error("Slug sudah digunakan. Gunakan slug lain.")
  }

  const authorId = session.user.id

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      published,
      publishedAt: published ? new Date() : null,
      scheduledFor,
      authorId,
    },
  })

  revalidatePath("/blog")
  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

export async function updatePostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const id = getString(formData, "id")
  const title = getString(formData, "title")
  const slug = ensureSlug(getString(formData, "slug") || title)
  const content = getString(formData, "content")
  const excerpt = getString(formData, "excerpt")
  const category = getString(formData, "category") || "General"
  const tags = parseTagsInput(formData.get("tags")?.toString() ?? "")
  const published = formData.get("published") === "on"
  const scheduledFor = getOptionalDate(formData, "scheduledFor")

  const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  if (existing && existing.id !== id) {
    throw new Error("Slug sudah digunakan. Gunakan slug lain.")
  }

  await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      published,
      scheduledFor,
      publishedAt: published ? new Date() : null,
    },
  })

  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)
  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

export async function deletePostAction(formData: FormData) {
  const id = getString(formData, "id")

  await prisma.post.delete({ where: { id } })

  revalidatePath("/blog")
  revalidatePath("/admin/posts")
}

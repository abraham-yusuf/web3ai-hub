"use server"

import { prisma } from "@/lib/prisma"
import { ensureSlug, parseTagsInput } from "@/lib/posts"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { PostStatus } from "@prisma/client"

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

/**
 * Estimate read time from word count (avg 200 wpm).
 */
function estimateReadTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Create a revision snapshot before updating a post.
 */
async function createRevision(postId: string, authorId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return

  await prisma.postRevision.create({
    data: {
      postId,
      version: post.version,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      authorId,
    },
  })
}

// ── CREATE ─────────────────────────────────────────────────────────────────

export async function createPostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const title = getString(formData, "title")
  const slugInput = getString(formData, "slug")
  const content = getString(formData, "content")
  const excerpt = getString(formData, "excerpt")
  const category = getString(formData, "category") || "General"
  const tags = parseTagsInput(formData.get("tags")?.toString() ?? "")
  const scheduledFor = getOptionalDate(formData, "scheduledFor")

  const slug = ensureSlug(slugInput || title)

  const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  if (existing) throw new Error("Slug sudah digunakan. Gunakan slug lain.")

  // Determine initial status
  const action = formData.get("action") as string | null
  let status: PostStatus = "DRAFT"
  if (action === "submit_for_review") {
    status = "IN_REVIEW"
  }

  const authorId = session.user.id
  const readTimeMinutes = estimateReadTime(content)

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      published: false,
      publishedAt: null,
      scheduledFor,
      status,
      submittedForReviewAt: status === "IN_REVIEW" ? new Date() : null,
      readTimeMinutes,
      authorId,
    },
  })

  revalidatePath("/blog")
  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

// ── UPDATE ──────────────────────────────────────────────────────────────────

export async function updatePostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const title = getString(formData, "title")
  const slug = ensureSlug(getString(formData, "slug") || title)
  const content = getString(formData, "content")
  const excerpt = getString(formData, "excerpt")
  const category = getString(formData, "category") || "General"
  const tags = parseTagsInput(formData.get("tags")?.toString() ?? "")
  const scheduledFor = getOptionalDate(formData, "scheduledFor")
  const authorId = session.user.id

  const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  if (existing && existing.id !== id) throw new Error("Slug sudah digunakan. Gunakan slug lain.")

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) throw new Error("Post tidak ditemukan")

  // Snapshot current version before overwriting
  await createRevision(id, authorId)

  const action = formData.get("action") as string | null
  const readTimeMinutes = estimateReadTime(content)

  // Status transition logic
  let status = post.status
  let published = post.published
  let publishedAt = post.publishedAt

  if (action === "submit_for_review") {
    // Only submit if currently a draft
    if (post.status === "DRAFT") {
      status = "IN_REVIEW"
    }
  } else if (action === "publish") {
    // Direct publish (editor/admin bypass)
    status = "PUBLISHED"
    published = true
    publishedAt = new Date()
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      scheduledFor,
      status,
      published,
      publishedAt,
      readTimeMinutes,
      version: { increment: 1 },
    },
  })

  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)
  revalidatePath("/admin/posts")

  // If status changed, stay on edit page to show feedback
  if (action === "submit_for_review" || action === "publish") {
    redirect(`/admin/posts/${id}/edit?status=${status.toLowerCase()}`)
  }

  redirect("/admin/posts")
}

// ── DELETE ──────────────────────────────────────────────────────────────────

export async function deletePostAction(formData: FormData) {
  const id = getString(formData, "id")
  await prisma.post.delete({ where: { id } })
  revalidatePath("/blog")
  revalidatePath("/admin/posts")
}

// ── SUBMIT FOR REVIEW ────────────────────────────────────────────────────────

export async function submitForReviewAction(postId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) throw new Error("Post tidak ditemukan")
  if (post.status !== "DRAFT") throw new Error("Hanya post berstatus DRAFT yang bisa disubmit")

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "IN_REVIEW",
      submittedForReviewAt: new Date(),
      reviewedAt: null,
      reviewerNotes: null,
      approvedById: null,
      rejectedById: null,
    },
  })

  revalidatePath("/admin/posts")
  revalidatePath(`/admin/posts/${postId}/edit`)
}

// ── APPROVE ─────────────────────────────────────────────────────────────────

export async function approvePostAction(postId: string, notes?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Hanya Admin atau Editor yang bisa approve post")
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) throw new Error("Post tidak ditemukan")
  if (post.status !== "IN_REVIEW") throw new Error("Hanya post berstatus IN_REVIEW yang bisa diapprove")

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "APPROVED",
      approvedById: session.user.id,
      reviewedAt: new Date(),
      reviewerNotes: notes ?? null,
      rejectedById: null,
    },
  })

  revalidatePath("/admin/posts")
  revalidatePath(`/admin/posts/${postId}/edit`)
}

// ── REJECT ──────────────────────────────────────────────────────────────────

export async function rejectPostAction(postId: string, notes: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Hanya Admin atau Editor yang bisa reject post")
  }

  if (!notes?.trim()) throw new Error("Catatan reviewer wajib diisi saat menolak post")

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) throw new Error("Post tidak ditemukan")
  if (post.status !== "IN_REVIEW") throw new Error("Hanya post berstatus IN_REVIEW yang bisa ditolak")

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "DRAFT", // Send back to author for revision
      rejectedById: session.user.id,
      reviewedAt: new Date(),
      reviewerNotes: notes,
      approvedById: null,
    },
  })

  revalidatePath("/admin/posts")
  revalidatePath(`/admin/posts/${postId}/edit`)
}

// ── PUBLISH APPROVED POST ────────────────────────────────────────────────────

export async function publishPostAction(postId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Hanya Admin atau Editor yang bisa publish post")
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) throw new Error("Post tidak ditemukan")
  if (post.status !== "APPROVED" && post.status !== "IN_REVIEW") {
    throw new Error("Post harus berstatus APPROVED atau IN_REVIEW untuk dipublish")
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "PUBLISHED",
      published: true,
      publishedAt: new Date(),
    },
  })

  revalidatePath("/blog")
  revalidatePath("/admin/posts")
  revalidatePath(`/admin/posts/${postId}/edit`)
}

// ── REVERT TO REVISION ───────────────────────────────────────────────────────

export async function revertToRevisionAction(postId: string, version: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const revision = await prisma.postRevision.findUnique({
    where: { postId_version: { postId, version } },
  })
  if (!revision) throw new Error("Revision tidak ditemukan")

  await createRevision(postId, session.user.id) // snapshot current before revert

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: revision.title,
      content: revision.content,
      excerpt: revision.excerpt,
      version: { increment: 1 },
    },
  })

  revalidatePath("/blog")
  revalidatePath(`/admin/posts/${postId}/edit`)
}

// ── ADD / REMOVE CO-AUTHOR ───────────────────────────────────────────────────

export async function addCoAuthorAction(postId: string, userId: string, role: string = "CONTRIBUTOR") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Hanya Admin atau Editor yang bisa mengelola co-author")
  }

  await prisma.postCoAuthor.upsert({
    where: { postId_userId: { postId, userId } },
    create: { postId, userId, role },
    update: { role },
  })

  revalidatePath(`/admin/posts/${postId}/edit`)
}

export async function removeCoAuthorAction(postId: string, userId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Hanya Admin atau Editor yang bisa mengelola co-author")
  }

  await prisma.postCoAuthor.deleteMany({
    where: { postId, userId },
  })

  revalidatePath(`/admin/posts/${postId}/edit`)
}
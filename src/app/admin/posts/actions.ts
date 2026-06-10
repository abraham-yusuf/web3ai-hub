"use server"

import { prisma } from "@/lib/prisma"
import { ensureSlug, parseTagsInput } from "@/lib/posts"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { auditLog } from "@/lib/audit-log"

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function getOptionalDate(formData: FormData, key: string): Date | null {
  const value = getString(formData, key)
  if (!value) return null
  // Treat input as Asia/Jakarta (WIB)
  const wibValue = value.includes("T") ? `${value}:00.000+07:00` : value
  const parsed = new Date(wibValue)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function calculateReadingTime(wordCount: number): number {
  // Average reading speed: 200 words/minute
  return Math.max(1, Math.ceil(wordCount / 200))
}

function countWords(text: string): number {
  return text
    .replace(/<[^>]*>/g, " ") // strip HTML tags
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length
}

/** Create a new revision snapshot before updating a post */
async function snapshotRevision(postId: string, authorId: string, reason: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true, content: true, excerpt: true, category: true, tags: true, wordCount: true },
  })
  if (!post) return

  // Get current max version for this post
  const maxVersion = await prisma.postRevision.findFirst({
    where: { postId },
    orderBy: { version: "desc" },
    select: { version: true },
  })

  await prisma.postRevision.create({
    data: {
      postId,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt ?? "",
      category: post.category,
      tags: post.tags,
      wordCount: post.wordCount,
      version: (maxVersion?.version ?? 0) + 1,
      reason,
      authorId,
    },
  })
}

export async function createPostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const title = getString(formData, "title")
  const slugInput = getString(formData, "slug")
  const content = getString(formData, "content")
  const excerpt = getString(formData, "excerpt")
  const category = getString(formData, "category") || "General"
  const tags = parseTagsInput(formData.get("tags")?.toString() ?? "")
  const status = formData.get("status")?.toString() as string || "DRAFT"
  const published = formData.get("published") === "on"
  const scheduledFor = getOptionalDate(formData, "scheduledFor")
  const wordCount = countWords(content)
  const readingTime = calculateReadingTime(wordCount)

  const slug = ensureSlug(slugInput || title)
  const authorId = session.user.id

  const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  if (existing) throw new Error("Slug sudah digunakan. Gunakan slug lain.")

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      wordCount,
      readingTime,
      status: (status as any) || "DRAFT",
      published,
      publishedAt: published ? new Date() : null,
      scheduledFor,
      authorId,
    },
  })

  // Create initial revision
  await prisma.postRevision.create({
    data: {
      postId: post.id,
      title,
      content,
      excerpt: excerpt ?? "",
      category,
      tags,
      wordCount,
      version: 1,
      reason: "Initial draft",
      authorId,
    },
  })

  await auditLog("post.create", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: post.id,
    details: { title, slug, category, status },
  })

  revalidatePath("/blog")
  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

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
  const status = formData.get("status")?.toString() as string
  const published = formData.get("published") === "on"
  const scheduledFor = getOptionalDate(formData, "scheduledFor")
  const reason = getString(formData, "revisionReason") || "Content update"
  const wordCount = countWords(content)
  const readingTime = calculateReadingTime(wordCount)

  const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  if (existing && existing.id !== id) throw new Error("Slug sudah digunakan. Gunakan slug lain.")

  // Snapshot before saving (only if content changed)
  const oldPost = await prisma.post.findUnique({ where: { id }, select: { content: true } })
  if (oldPost && oldPost.content !== content) {
    await snapshotRevision(id, session.user.id, reason)
  }

  const now = new Date()
  const isPublishing = published && status === "PUBLISHED"

  await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      wordCount,
      readingTime,
      status: (status as any) || undefined,
      published,
      publishedAt: isPublishing ? now : undefined,
      scheduledFor,
    },
  })

  await auditLog("post.update", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: id,
    details: { title, slug, category, status },
  })

  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)
  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

export async function submitForReviewAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  await snapshotRevision(id, session.user.id, "Submitted for review")

  await prisma.post.update({
    where: { id },
    data: { status: "PENDING_REVIEW" },
  })

  await auditLog("post.submit-review", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: id,
  })

  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

export async function approvePostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Unauthorized — hanya admin/editor yang bisa approve")
  }

  const id = getString(formData, "id")
  await snapshotRevision(id, session.user.id, "Approved for publication")

  await prisma.post.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedBy: session.user.id,
      approvedAt: new Date(),
    },
  })

  await auditLog("post.approve", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: id,
  })

  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

export async function publishPostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Unauthorized")
  }

  const id = getString(formData, "id")
  await snapshotRevision(id, session.user.id, "Published")

  await prisma.post.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      published: true,
      publishedAt: new Date(),
    },
  })

  await auditLog("post.publish", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: id,
  })

  revalidatePath("/blog")
  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

export async function archivePostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  await snapshotRevision(id, session.user.id, "Archived")

  await prisma.post.update({
    where: { id },
    data: { status: "ARCHIVED", published: false },
  })

  await auditLog("post.archive", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: id,
  })

  revalidatePath("/admin/posts")
  redirect("/admin/posts")
}

export async function restoreRevisionAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const postId = getString(formData, "postId")
  const revisionId = getString(formData, "revisionId")
  const reason = getString(formData, "reason") || "Restored from revision"

  // Snapshot current state before restoring
  await snapshotRevision(postId, session.user.id, `Before restore to v${revisionId}`)

  const revision = await prisma.postRevision.findUnique({ where: { id: revisionId } })
  if (!revision) throw new Error("Revision not found")

  const wordCount = countWords(revision.content)
  const readingTime = calculateReadingTime(wordCount)

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: revision.title,
      content: revision.content,
      excerpt: revision.excerpt,
      category: revision.category,
      tags: revision.tags,
      wordCount,
      readingTime,
    },
  })

  await auditLog("post.restore-revision", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: postId,
    details: { revisionId },
  })

  revalidatePath("/admin/posts")
  revalidatePath("/blog")
  redirect("/admin/posts")
}

export async function addCoAuthorAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Unauthorized")
  }

  const postId = getString(formData, "postId")
  const userId = getString(formData, "userId")
  const role = getString(formData, "coAuthorRole") || "co-author"

  if (!userId) throw new Error("User ID diperlukan")

  await prisma.postAuthor.upsert({
    where: { postId_userId: { postId, userId } },
    create: { postId, userId, role },
    update: { role },
  })

  await auditLog("post.add-coauthor", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: postId,
    details: { coAuthorId: userId, role },
  })

  revalidatePath("/admin/posts")
  redirect(`/admin/posts/${postId}/edit`)
}

export async function removeCoAuthorAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const postId = getString(formData, "postId")
  const userId = getString(formData, "userId")

  await prisma.postAuthor.deleteMany({ where: { postId, userId } })

  await auditLog("post.remove-coauthor", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: postId,
    details: { coAuthorId: userId },
  })

  revalidatePath("/admin/posts")
  redirect(`/admin/posts/${postId}/edit`)
}

export async function deletePostAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const post = await prisma.post.findUnique({ where: { id }, select: { title: true, slug: true } })

  await prisma.post.delete({ where: { id } })

  await auditLog("post.delete", session.user.email ?? session.user.name ?? "unknown", "Post", {
    actorId: session.user.id,
    resourceId: id,
    details: { title: post?.title, slug: post?.slug },
  })

  revalidatePath("/blog")
  revalidatePath("/admin/posts")
}
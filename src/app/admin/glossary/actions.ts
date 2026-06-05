"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { auditLog } from "@/lib/audit-log"

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function parseTagsInput(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function getGlossaryEntriesAction(language?: string) {
  const where = language && language !== "all" ? { language } : undefined
  return prisma.glossaryEntry.findMany({
    where,
    orderBy: { term: "asc" },
  })
}

export async function getGlossaryByIdAction(id: string) {
  return prisma.glossaryEntry.findUnique({ where: { id } })
}

export async function createGlossaryEntryAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const term = getString(formData, "term")
  const slug = toSlug(term)
  const definition = getString(formData, "definition")
  const example = getString(formData, "example")
  const category = getString(formData, "category")
  const tagsInput = getString(formData, "tags")
  const language = getString(formData, "language") || "id"
  const isPublished = formData.get("isPublished") === "on"

  if (!term || !definition) throw new Error("Term and definition are required")

  const existing = await prisma.glossaryEntry.findUnique({ where: { slug }, select: { id: true } })
  if (existing) throw new Error("Slug sudah digunakan. Gunakan term lain.")

  const entry = await prisma.glossaryEntry.create({
    data: {
      term,
      slug,
      definition,
      example: example || null,
      category: category || null,
      tags: parseTagsInput(tagsInput),
      language,
      isPublished,
    },
  })

  await auditLog("glossary.create", session.user.email ?? session.user.name ?? "unknown", "Glossary", {
    actorId: session.user.id,
    resourceId: entry.id,
    details: { term, slug, language },
  })

  revalidatePath("/glossary")
  revalidatePath("/admin/glossary")
  redirect("/admin/glossary")
}

export async function updateGlossaryEntryAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const term = getString(formData, "term")
  const definition = getString(formData, "definition")
  const example = getString(formData, "example")
  const category = getString(formData, "category")
  const tagsInput = getString(formData, "tags")
  const language = getString(formData, "language") || "id"
  const isPublished = formData.get("isPublished") === "on"

  if (!term || !definition) throw new Error("Term and definition are required")

  const existing = await prisma.glossaryEntry.findUnique({ where: { id } })
  if (!existing) throw new Error("Entry not found")

  const slug = toSlug(term)
  const duplicate = await prisma.glossaryEntry.findFirst({
    where: { slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) throw new Error("Slug sudah digunakan. Gunakan term lain.")

  await prisma.glossaryEntry.update({
    where: { id },
    data: {
      term,
      slug,
      definition,
      example: example || null,
      category: category || null,
      tags: parseTagsInput(tagsInput),
      language,
      isPublished,
    },
  })

  await auditLog("glossary.update", session.user.email ?? session.user.name ?? "unknown", "Glossary", {
    actorId: session.user.id,
    resourceId: id,
    details: { term, slug, language },
  })

  revalidatePath("/glossary")
  revalidatePath("/admin/glossary")
  redirect("/admin/glossary")
}

export async function deleteGlossaryEntryAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const entry = await prisma.glossaryEntry.findUnique({ where: { id }, select: { term: true, slug: true } })
  await prisma.glossaryEntry.delete({ where: { id } })

  await auditLog("glossary.delete", session.user.email ?? session.user.name ?? "unknown", "Glossary", {
    actorId: session.user.id,
    resourceId: id,
    details: { term: entry?.term, slug: entry?.slug },
  })

  revalidatePath("/glossary")
  revalidatePath("/admin/glossary")
}

export async function importGlossaryEntriesAction(
  entries: Array<{
    term: string
    definition: string
    example?: string
    category?: string
    tags?: string
    language?: string
  }>
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Unauthorized")
  }

  const data = entries.map((e) => ({
    term: e.term,
    slug: toSlug(e.term),
    definition: e.definition,
    example: e.example || null,
    category: e.category || null,
    tags: e.tags ? parseTagsInput(e.tags) : [],
    language: e.language || "id",
    isPublished: false,
  }))

  await prisma.glossaryEntry.createMany({
    data,
    skipDuplicates: true,
  })

  await auditLog("glossary.bulk-import", session.user.email ?? session.user.name ?? "unknown", "Glossary", {
    actorId: session.user.id,
    details: { count: entries.length },
  })

  revalidatePath("/glossary")
  revalidatePath("/admin/glossary")
}
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { auditLog } from "@/lib/audit-log"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    throw new Error("Unauthorized")
  }
  return session
}

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

export async function createCollectionAction(formData: FormData) {
  const session = await requireAdmin()

  const name = getString(formData, "name")
  const slug = toSlug(getString(formData, "slug") || name)

  const collection = await prisma.toolCollection.create({
    data: {
      name,
      slug,
      description: getString(formData, "description") || null,
      isPublic: formData.get("isPublic") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      color: getString(formData, "color") || null,
    },
  })

  await auditLog("collection.create", session.user.email ?? session.user.name ?? "unknown", "ToolCollection", {
    actorId: session.user.id,
    resourceId: collection.id,
    details: { name, slug },
  })

  revalidatePath("/collections")
  revalidatePath("/admin/collections")
  redirect("/admin/collections")
}

export async function updateCollectionAction(formData: FormData) {
  const session = await requireAdmin()

  const id = getString(formData, "id")
  const name = getString(formData, "name")
  const slug = toSlug(getString(formData, "slug") || name)

  await prisma.toolCollection.update({
    where: { id },
    data: {
      name,
      slug,
      description: getString(formData, "description") || null,
      isPublic: formData.get("isPublic") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      color: getString(formData, "color") || null,
    },
  })

  await auditLog("collection.update", session.user.email ?? session.user.name ?? "unknown", "ToolCollection", {
    actorId: session.user.id,
    resourceId: id,
    details: { name, slug },
  })

  revalidatePath("/collections")
  revalidatePath("/collections/[slug]", "page")
  revalidatePath("/admin/collections")
  redirect("/admin/collections")
}

export async function deleteCollectionAction(formData: FormData) {
  const session = await requireAdmin()

  const id = getString(formData, "id")
  const collection = await prisma.toolCollection.findUnique({
    where: { id },
    select: { name: true, slug: true },
  })

  await prisma.toolCollection.delete({ where: { id } })

  await auditLog("collection.delete", session.user.email ?? session.user.name ?? "unknown", "ToolCollection", {
    actorId: session.user.id,
    resourceId: id,
    details: { name: collection?.name, slug: collection?.slug },
  })

  revalidatePath("/collections")
  revalidatePath("/admin/collections")
}

export async function addToolToCollectionAction(formData: FormData) {
  const session = await requireAdmin()

  const collectionId = getString(formData, "collectionId")
  const toolId = getString(formData, "toolId")

  const collection = await prisma.toolCollection.findUnique({
    where: { id: collectionId },
  })
  const tool = await prisma.aITool.findUnique({
    where: { id: toolId },
    select: { name: true },
  })

  if (!collection || !tool) {
    throw new Error("Collection or tool not found")
  }

  // Get current max order
  const maxOrder = await prisma.toolCollectionItem.aggregate({
    where: { collectionId },
    _max: { order: true },
  })

  await prisma.toolCollectionItem.upsert({
    where: {
      collectionId_toolId: {
        collectionId,
        toolId,
      },
    },
    create: {
      collectionId,
      toolId,
      order: (maxOrder._max.order ?? 0) + 1,
    },
    update: {},
  })

  await auditLog("collection.addTool", session.user.email ?? session.user.name ?? "unknown", "ToolCollection", {
    actorId: session.user.id,
    resourceId: collectionId,
    details: { collectionName: collection.name, toolName: tool.name },
  })

  revalidatePath("/collections")
  revalidatePath("/collections/[slug]", "page")
  revalidatePath("/admin/collections")
  redirect("/admin/collections")
}

export async function removeToolFromCollectionAction(formData: FormData) {
  const session = await requireAdmin()

  const collectionId = getString(formData, "collectionId")
  const toolId = getString(formData, "toolId")

  await prisma.toolCollectionItem.deleteMany({
    where: { collectionId, toolId },
  })

  await auditLog("collection.removeTool", session.user.email ?? session.user.name ?? "unknown", "ToolCollection", {
    actorId: session.user.id,
    resourceId: collectionId,
    details: { toolId },
  })

  revalidatePath("/collections")
  revalidatePath("/collections/[slug]", "page")
  revalidatePath("/admin/collections")
}

export async function reorderCollectionToolsAction(collectionId: string, toolIds: string[]) {
  const session = await requireAdmin()

  // Update order for each tool
  for (let i = 0; i < toolIds.length; i++) {
    await prisma.toolCollectionItem.updateMany({
      where: { collectionId, toolId: toolIds[i] },
      data: { order: i },
    })
  }

  revalidatePath("/collections")
  revalidatePath("/collections/[slug]", "page")
  revalidatePath("/admin/collections")
}
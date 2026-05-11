"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createLearnPageAction(formData: FormData) {
  const title = formData.get("title")?.toString() || ""
  const slug = formData.get("slug")?.toString() || ""
  const content = formData.get("content")?.toString() || ""
  const sectionId = formData.get("sectionId")?.toString() || ""
  const order = parseInt(formData.get("order")?.toString() || "0", 10)

  if (!title || !slug || !content || !sectionId) {
    throw new Error("Missing required fields")
  }

  await prisma.learnPage.create({
    data: {
      title,
      slug,
      content,
      sectionId,
      order,
    },
  })

  revalidatePath("/learn")
  revalidatePath("/admin/learn")
  redirect("/admin/learn")
}

export async function updateLearnPageAction(formData: FormData) {
  const id = formData.get("id")?.toString() || ""
  const title = formData.get("title")?.toString() || ""
  const slug = formData.get("slug")?.toString() || ""
  const content = formData.get("content")?.toString() || ""
  const sectionId = formData.get("sectionId")?.toString() || ""
  const order = parseInt(formData.get("order")?.toString() || "0", 10)

  if (!id || !title || !slug || !content || !sectionId) {
    throw new Error("Missing required fields")
  }

  await prisma.learnPage.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      sectionId,
      order,
    },
  })

  revalidatePath("/learn")
  revalidatePath(`/learn/${slug}`)
  revalidatePath("/admin/learn")
  redirect("/admin/learn")
}

export async function deleteLearnPageAction(formData: FormData) {
  const id = formData.get("id")?.toString() || ""
  if (!id) return

  await prisma.learnPage.delete({ where: { id } })

  revalidatePath("/learn")
  revalidatePath("/admin/learn")
}

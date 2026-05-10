"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function requireAirdropAdmin() {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    throw new Error("Unauthorized")
  }
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

function parseJsonArray(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseSteps(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ title: line }))
}

export async function createAirdropAction(formData: FormData) {
  await requireAirdropAdmin()

  const name = getString(formData, "name")
  const slug = toSlug(getString(formData, "slug") || name)

  await prisma.airdrop.create({
    data: {
      name,
      slug,
      network: getString(formData, "network") || "Unknown",
      status: (getString(formData, "status") || "ACTIVE") as "ACTIVE" | "UPCOMING" | "ENDED",
      difficulty: (getString(formData, "difficulty") || "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
      estimatedReward: getString(formData, "estimatedReward") || null,
      content: getString(formData, "content") || "# Airdrop Guide",
      requirements: parseJsonArray(getString(formData, "requirements")),
      steps: parseSteps(getString(formData, "steps")),
      links: {
        website: getString(formData, "website") || undefined,
        twitter: getString(formData, "twitter") || undefined,
        discord: getString(formData, "discord") || undefined,
      },
    },
  })

  revalidatePath("/airdrop")
  revalidatePath("/admin/airdrops")
  redirect("/admin/airdrops")
}

export async function updateAirdropAction(formData: FormData) {
  await requireAirdropAdmin()

  const id = getString(formData, "id")
  const name = getString(formData, "name")
  const slug = toSlug(getString(formData, "slug") || name)

  await prisma.airdrop.update({
    where: { id },
    data: {
      name,
      slug,
      network: getString(formData, "network") || "Unknown",
      status: (getString(formData, "status") || "ACTIVE") as "ACTIVE" | "UPCOMING" | "ENDED",
      difficulty: (getString(formData, "difficulty") || "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
      estimatedReward: getString(formData, "estimatedReward") || null,
      content: getString(formData, "content") || "# Airdrop Guide",
      requirements: parseJsonArray(getString(formData, "requirements")),
      steps: parseSteps(getString(formData, "steps")),
      links: {
        website: getString(formData, "website") || undefined,
        twitter: getString(formData, "twitter") || undefined,
        discord: getString(formData, "discord") || undefined,
      },
    },
  })

  revalidatePath("/airdrop")
  revalidatePath(`/airdrop/${slug}`)
  revalidatePath("/admin/airdrops")
  redirect("/admin/airdrops")
}

export async function deleteAirdropAction(formData: FormData) {
  await requireAirdropAdmin()

  const id = getString(formData, "id")
  await prisma.airdrop.delete({ where: { id } })

  revalidatePath("/airdrop")
  revalidatePath("/admin/airdrops")
}


export async function bulkUpdateAirdropStatusAction(formData: FormData) {
  await requireAirdropAdmin()

  const ids = formData
    .getAll("ids")
    .filter((value): value is string => typeof value === "string" && value.length > 0)
  const status = getString(formData, "status") as "ACTIVE" | "UPCOMING" | "ENDED"

  if (!ids.length || !["ACTIVE", "UPCOMING", "ENDED"].includes(status)) {
    revalidatePath("/admin/airdrops")
    return
  }

  const affectedAirdrops = await prisma.airdrop.findMany({
    where: { id: { in: ids } },
    select: { slug: true },
  })

  await prisma.airdrop.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })

  revalidatePath("/airdrop")
  revalidatePath("/admin/airdrops")
  affectedAirdrops.forEach((airdrop) => revalidatePath(`/airdrop/${airdrop.slug}`))
}

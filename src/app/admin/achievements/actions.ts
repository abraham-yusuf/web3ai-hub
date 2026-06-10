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

export async function toggleAchievementActiveAction(formData: FormData) {
  const session = await requireAdmin()

  const id = getString(formData, "id")
  const currentActive = formData.get("active") === "true"

  const achievement = await prisma.achievement.update({
    where: { id },
    data: { active: !currentActive },
  })

  await auditLog(
    "achievement.toggle",
    session.user.email ?? session.user.name ?? "unknown",
    "Achievement",
    {
      actorId: session.user.id,
      resourceId: id,
      details: { slug: achievement.slug, active: !currentActive },
    }
  )

  revalidatePath("/admin/achievements")
}

export async function createAchievementAction(formData: FormData) {
  const session = await requireAdmin()

  const slug = getString(formData, "slug")
  const name = getString(formData, "name")
  const description = getString(formData, "description")
  const icon = getString(formData, "icon") || "🏆"
  const tier = (getString(formData, "tier") || "BRONZE") as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND"
  const xpReward = parseInt(getString(formData, "xpReward")) || 10
  const trigger = getString(formData, "trigger")
  const threshold = parseInt(getString(formData, "threshold")) || 1

  if (!slug || !name || !description || !trigger) {
    throw new Error("Missing required fields")
  }

  const achievement = await prisma.achievement.create({
    data: {
      slug,
      name,
      description,
      icon,
      tier,
      xpReward,
      trigger,
      threshold,
      active: true,
    },
  })

  await auditLog(
    "achievement.create",
    session.user.email ?? session.user.name ?? "unknown",
    "Achievement",
    {
      actorId: session.user.id,
      resourceId: achievement.id,
      details: { slug, name, tier },
    }
  )

  revalidatePath("/admin/achievements")
  redirect("/admin/achievements")
}
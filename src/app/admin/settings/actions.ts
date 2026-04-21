"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { encryptSecret } from "@/lib/ai/encryption"
import { getAISettings } from "@/lib/ai/settings"
import { AD_SECTIONS } from "@/lib/ads"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { AI_PROVIDERS } from "@/lib/ai/types"

function requireAdminRole(role?: string) {
  if (role !== "ADMIN") {
    throw new Error("Hanya ADMIN yang dapat mengubah settings.")
  }
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export async function saveAISettingsAction(formData: FormData) {
  const session = await auth()
  requireAdminRole(session?.user?.role)

  const existing = await getAISettings()

  const nextSettingsRecord: Record<string, Prisma.InputJsonValue> = {}

  for (const provider of AI_PROVIDERS) {
    const enabled = formData.get(`${provider}_enabled`) === "on"
    const model = getString(formData, `${provider}_model`) || existing[provider].model
    const temperatureInput = Number(getString(formData, `${provider}_temperature`) || existing[provider].temperature)
    const rawKey = getString(formData, `${provider}_api_key`).trim()

    const encryptedApiKey = rawKey
      ? encryptSecret(rawKey)
      : existing[provider].encryptedApiKey

    nextSettingsRecord[provider] = {
      enabled,
      model,
      temperature: Number.isFinite(temperatureInput) ? Math.min(1, Math.max(0, temperatureInput)) : 0.7,
      encryptedApiKey,
    }
  }

  const nextSettings = nextSettingsRecord as Prisma.InputJsonObject

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      aiProviders: nextSettings,
    },
    update: {
      aiProviders: nextSettings,
    },
  })

  revalidatePath("/admin/settings")
  revalidatePath("/admin/ai-writer")
}

export async function saveAdSettingsAction(formData: FormData) {
  const session = await auth()
  requireAdminRole(session?.user?.role)

  const globallyEnabled = formData.get("ads_globally_enabled") === "on"
  const clientId = getString(formData, "ads_client_id").trim()

  const sections: Record<string, Prisma.InputJsonValue> = {}

  for (const section of AD_SECTIONS) {
    sections[section] = {
      enabled: formData.get(`ads_${section}_enabled`) === "on",
      slotId: getString(formData, `ads_${section}_slot_id`).trim(),
    }
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      adSenseConfig: {
        globallyEnabled,
        clientId,
        sections,
      },
    },
    update: {
      adSenseConfig: {
        globallyEnabled,
        clientId,
        sections,
      },
    },
  })

  revalidatePath("/admin/settings")
  revalidatePath("/blog")
  revalidatePath("/learn")
  revalidatePath("/ai-tools")
}

"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { encryptSecret } from "@/lib/ai/encryption"
import { getAISettings } from "@/lib/ai/settings"
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

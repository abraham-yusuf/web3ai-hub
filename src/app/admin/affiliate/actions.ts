"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createExperimentAction(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const targetPage = formData.get("targetPage") as string | null
  const metric = formData.get("metric") as string ?? "ctr"

  // Parse variants from form (control + up to 3 treatments)
  const variants = []
  for (let i = 0; i < 4; i++) {
    const vId = formData.get(`variant_${i}_id`) as string
    const vLabel = formData.get(`variant_${i}_label`) as string
    const vWeight = formData.get(`variant_${i}_weight`) as string
    const vCtaText = formData.get(`variant_${i}_ctaText`) as string
    const vCtaColor = formData.get(`variant_${i}_ctaColor`) as string
    const vCtaPosition = formData.get(`variant_${i}_ctaPosition`) as string

    if (vId && vLabel) {
      variants.push({
        id: vId,
        label: vLabel,
        weight: parseInt(vWeight) || 50,
        config: {
          ctaText: vCtaText || undefined,
          ctaColor: vCtaColor || undefined,
          ctaPosition: vCtaPosition || undefined,
        },
      })
    }
  }

  if (variants.length < 2) {
    throw new Error("At least 2 variants required")
  }

  await prisma.affiliateExperiment.create({
    data: {
      name,
      description: description || null,
      targetPage: targetPage || null,
      metric,
      variants,
      status: "draft",
    },
  })

  revalidatePath("/admin/affiliate")
  redirect("/admin/affiliate")
}

export async function updateExperimentStatusAction(formData: FormData) {
  const id = formData.get("id") as string
  const status = formData.get("status") as string

  const data: Record<string, unknown> = { status }
  if (status === "running") data.startedAt = new Date()
  if (status === "completed") data.endedAt = new Date()

  await prisma.affiliateExperiment.update({
    where: { id },
    data,
  })

  revalidatePath("/admin/affiliate")
}

export async function setExperimentWinnerAction(formData: FormData) {
  const id = formData.get("id") as string
  const winnerId = formData.get("winnerId") as string

  await prisma.affiliateExperiment.update({
    where: { id },
    data: { winnerId, status: "completed", endedAt: new Date() },
  })

  revalidatePath("/admin/affiliate")
}

export async function deleteExperimentAction(formData: FormData) {
  const id = formData.get("id") as string
  await prisma.affiliateExperiment.delete({ where: { id } })
  revalidatePath("/admin/affiliate")
  redirect("/admin/affiliate")
}

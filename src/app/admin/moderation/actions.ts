"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ReportStatus } from "@prisma/client"

export async function moderateReportAction(
  reportId: string,
  action: "resolve" | "dismiss" | "review",
  resolution?: string,
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const statusMap: Record<string, ReportStatus> = {
    resolve: "RESOLVED",
    dismiss: "DISMISSED",
    review: "REVIEWING",
  }

  await prisma.contentReport.update({
    where: { id: reportId },
    data: {
      status: statusMap[action],
      moderatorId: session.user.id,
      resolution: resolution ?? null,
    },
  })

  revalidatePath("/admin/moderation")
}

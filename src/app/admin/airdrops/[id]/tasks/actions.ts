"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteTaskAction(taskId: string) {
  await prisma.airdropTask.delete({ where: { id: taskId } })
  revalidatePath("/admin/airdrops", "layout")
}
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const inputSchema = z.object({
  pageSlug: z.string().min(3),
  completed: z.boolean(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const parsed = inputSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await prisma.learnProgress.upsert({
    where: {
      userId_pageSlug: {
        userId: session.user.id,
        pageSlug: parsed.data.pageSlug,
      },
    },
    update: {
      completed: parsed.data.completed,
    },
    create: {
      userId: session.user.id,
      pageSlug: parsed.data.pageSlug,
      completed: parsed.data.completed,
    },
  })

  return NextResponse.json({ ok: true })
}

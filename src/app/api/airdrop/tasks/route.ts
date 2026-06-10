import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTaskSchema = z.object({
  airdropId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["social", "defi", "testnet", "bridge", "swap"]),
  xpReward: z.number().int().min(1).default(10),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const airdropId = searchParams.get("airdropId")

  const where: Record<string, string> = {}
  if (airdropId) where.airdropId = airdropId

  const tasks = await prisma.airdropTask.findMany({
    where,
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = createTaskSchema.parse(body)

    const task = await prisma.airdropTask.create({
      data: {
        airdropId: data.airdropId,
        title: data.title,
        description: data.description,
        type: data.type,
        xpReward: data.xpReward,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
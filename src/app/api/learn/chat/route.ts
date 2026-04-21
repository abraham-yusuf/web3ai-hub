import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { env } from "@/lib/env"

const inputSchema = z.object({
  title: z.string().min(1),
  context: z.string().min(20),
  question: z.string().min(3),
})

export const runtime = "nodejs"

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const parsed = inputSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (!env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY belum dikonfigurasi" }, { status: 503 })
  }

  const encoder = new TextEncoder()
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content:
                "Kamu tutor Web3 & AI. Jawab singkat, jelas, berbasis konteks materi yang diberikan. Jika tidak ada di konteks, katakan secara jujur.",
            },
            {
              role: "user",
              content: `Materi: ${parsed.data.title}\n\nKonteks:\n${parsed.data.context.slice(0, 5000)}\n\nPertanyaan:\n${parsed.data.question}`,
            },
          ],
        })

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) controller.enqueue(encoder.encode(content))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal menjawab pertanyaan"
        controller.enqueue(encoder.encode(`Error: ${message}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}

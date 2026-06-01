import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { env } from "@/lib/env"
import {
  createExplainTextPrompt,
  createSimplifyContentPrompt,
  createTranslateContentPrompt,
  createLearningAssistantPrompt,
} from "@/lib/ai/prompts"

const inputSchema = z.object({
  mode: z.enum(["explain", "simplify", "translate", "assistant"]).default("assistant"),
  pageTitle: z.string().min(1),
  content: z.string().min(10),
  selection: z.string().optional(),
  question: z.string().optional(),
  language: z.string().default("Indonesian"),
  translateTo: z.string().optional(),
  simplifyLevel: z.string().optional(),
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

  const { mode, pageTitle, content, selection, question, language, translateTo, simplifyLevel } =
    parsed.data

  let prompt: string
  switch (mode) {
    case "explain":
      prompt = createExplainTextPrompt(
        selection ?? content.slice(0, 200),
        content,
        language,
      )
      break
    case "simplify":
      prompt = createSimplifyContentPrompt(content, simplifyLevel ?? "intermediate", language)
      break
    case "translate":
      prompt = createTranslateContentPrompt(content, translateTo ?? "English")
      break
    default:
      prompt = createLearningAssistantPrompt(pageTitle, content, question ?? "", language)
  }

  const encoder = new TextEncoder()
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                "Kamu tutor AI3 yang helpful. Jawab dalam format Markdown yang rapi.",
            },
            { role: "user", content: prompt },
          ],
        })

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) controller.enqueue(encoder.encode(content))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memproses permintaan"
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
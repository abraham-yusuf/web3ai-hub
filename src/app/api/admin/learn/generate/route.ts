import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { streamWithProviderFallback } from "@/lib/ai/providers";
import { getAISettings } from "@/lib/ai/settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

// --- Schemas ---

const outlineSchema = z.object({
  title: z.string(),
  description: z.string(),
  lessons: z.array(z.object({
    title: z.string(),
    slug: z.string(),
    objective: z.string(),
    estimatedMinutes: z.number(),
  })),
});

const contentSchema = z.object({
  title: z.string(),
  content: z.string(), // MDX formatted
  summary: z.string(),
});

const generationRequestSchema = z.object({
  topic: z.string().min(3, "Topik harus jelas"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  targetAudience: z.string().optional(),
  sectionId: z.string().min(1, "Section ID wajib diisi untuk penempatan lesson"),
  provider: z.string().optional(),
});

// --- Helper: Get AI Response without streaming (for structured JSON) ---
async function generateStructuredJSON<T>(
  request: { prompt: string; provider?: string },
  settings: any,
  schema: z.ZodSchema<T>
): Promise<T> {
  let accumulatedText = "";
  await streamWithProviderFallback(
    {
      provider: request.provider || "openai",
      prompt: request.prompt,
      temperature: 0.5, // Lower temperature for more structured JSON
    },
    settings,
    (chunk) => {
      accumulatedText += chunk;
    }
  );

  const jsonString = accumulatedText.replace(/\\`\\`\\`json|\\`\\`\\`/g, "").trim();
  const parsed = JSON.parse(jsonString);
  return schema.parse(parsed);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { topic, level, targetAudience, sectionId, provider } = generationRequestSchema.parse(body);
    const settings = await getAISettings();

    // PHASE 1: GENERATE OUTLINE
    const outlinePrompt = `You are a Senior Curriculum Designer for AI3 (Web3 & AI Hub). Create a detailed lesson outline for:
Topic: ${topic}
Level: ${level}
Target Audience: ${targetAudience || "General Web3/AI learners"}

The outline should be a logical sequence of lessons that take a learner from zero to understanding.

OUTPUT FORMAT:
Return ONLY a JSON object:
{
  "title": "Curriculum Title",
  "description": "Overall objective of this series",
  "lessons": [
    {
      "title": "Lesson Title",
      "slug": "url-friendly-slug",
      "objective": "What the student will achieve",
      "estimatedMinutes": 15
    }
  ]
}
Ensure the slugs are unique and descriptive.`;

    const outline = await generateStructuredJSON({ prompt: outlinePrompt, provider }, settings, outlineSchema);

    // PHASE 2: GENERATE DETAILED CONTENT FOR EACH LESSON
    const generatedPages = [];

    for (const lesson of outline.lessons) {
      const contentPrompt = `You are writing a professional educational lesson for AI3. 
      Topic: ${lesson.title}
      Objective: ${lesson.objective}
      Level: ${level}
      
      REQUIREMENTS:
      1. Use MDX format.
      2. Use rich formatting: bolding, lists, and tables.
      3. Integrate "AI3 Components" where appropriate:
         - Use <Callout type="info"> or <Callout type="warning"> for key tips.
         - Use <Comparison> for comparing technologies.
         - Use code blocks for technical examples.
      4. Make the content engaging, deep, and actionable.
      5. Language: Use a professional yet accessible tone.

      OUTPUT FORMAT:
      Return ONLY a JSON object:
      {
        "title": "${lesson.title}",
        "content": "Full MDX content here",
        "summary": "Short summary of the lesson"
      }`;

      const content = await generateStructuredJSON({ prompt: contentPrompt, provider }, settings, contentSchema);

      // Save to Database immediately
      const page = await prisma.learnPage.create({
        data: {
          title: content.title,
          slug: lesson.slug,
          content: content.content,
          sectionId: sectionId,
          order: 0, // Will be updated by the caller or sequence
        },
      });

      generatedPages.push({
        id: page.id,
        slug: page.slug,
        title: content.title,
      });
    }

    return NextResponse.json({
      success: true,
      curriculum: outline,
      createdPages: generatedPages,
    });

  } catch (error) {
    console.error("[AI_LESSON_GENERATE_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input or AI output", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error during lesson generation" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAISettings } from "@/lib/ai/settings";
import { streamWithProviderFallback } from "@/lib/ai/providers";
import { AI_PROVIDERS } from "@/lib/ai/types";

// Validasi input request
const generatorSchema = z.object({
  goal: z.string().min(3, "Goal harus dijelaskan dengan cukup detail"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  timeCommitment: z.string().optional(),
  provider: z.enum(AI_PROVIDERS).optional(),
});

// Skema output AI untuk validasi JSON
interface RoadmapOutput {
  title: string;
  goal: string;
  steps: {
    title: string;
    description: string;
    type: "content" | "task";
    suggestedPageSlug?: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { goal, level, timeCommitment, provider } = generatorSchema.parse(body);
    const userId = session.user.id;

    // 2. Get AI Settings
    const settings = await getAISettings();

    // 3. Construct Prompt
    const existingPages = await prisma.learnPage.findMany({
      select: { slug: true, title: true },
    });
    const pagesContext = existingPages
      .map((p) => `${p.slug}: ${p.title}`)
      .join(", ");

    const prompt = `You are an expert Web3 and AI Curriculum Architect. Your task is to create a highly personalized learning roadmap for a user.

User Profile:
- Goal: ${goal}
- Current Level: ${level}
- Time Commitment: ${timeCommitment || "Standard"}

Context:
The platform "AI3 / Web3AI Hub" provides educational content. Below is the list of existing content pages available in our database:
[${pagesContext}]

Your roadmap should be structured as a sequence of logical steps.
Each step must be either:
1. "content": A learning topic. IF the topic matches one of the existing pages listed above, you MUST provide the exact 'suggestedPageSlug'. If no match is found, leave 'suggestedPageSlug' as null.
2. "task": A practical exercise, project, or research task for the user.

OUTPUT FORMAT:
You MUST respond ONLY with a valid JSON object. No markdown blocks, no preamble.
{
  "title": "Personalized Roadmap Title",
  "goal": "Concise summary of the learning objective",
  "steps": [
    {
      "title": "Step Title",
      "description": "Detailed explanation of what to learn or do",
      "type": "content" | "task",
      "suggestedPageSlug": "exact-slug-from-list-or-null"
    }
  ]
}

Ensure a logical progression from ${level} to the target goal. Be specific and actionable.`;

    // 4. Generate Roadmap using AI SDK with Fallback
    let accumulatedText = "";
    await streamWithProviderFallback(
      {
        provider: provider ?? "openai",
        prompt,
        temperature: 0.7,
      },
      settings,
      (chunk) => {
        accumulatedText += chunk;
      },
    );

    // Clean AI response (remove potential markdown blocks)
    const jsonString = accumulatedText.replace(/```json|```/g, "").trim();
    const roadmapData: RoadmapOutput = JSON.parse(jsonString);

    // 5. Save to Database
    const userRoadmap = await prisma.userRoadmap.create({
      data: {
        userId: userId,
        title: roadmapData.title,
        goal: roadmapData.goal,
        level: level,
        steps: {
          create: roadmapData.steps.map((step, index) => ({
            title: step.title,
            description: step.description,
            order: index,
            type: step.type,
            pageSlug: step.suggestedPageSlug,
          })),
        },
      },
      include: {
        steps: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      roadmap: userRoadmap 
    });

  } catch (error) {
    console.error("[LEARN_GENERATE_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error during roadmap generation" }, { status: 500 });
  }
}

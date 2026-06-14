import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getClientIdentity, RATE_LIMIT_TIERS } from "@/lib/rate-limiter"

const submitSchema = z.object({
  title: z.string().min(10).max(200),
  category: z.enum(["web3", "ai", "airdrop", "opinion"]),
  content: z.string().min(500),
  excerpt: z.string().max(300).optional(),
})

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9s-]/g, "")
    .replace(/s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return `community-${base}-${Date.now()}`;
}

function countWords(text: string): number {
  return text.replace(/s+/g, " ").trim().split(" ").filter(Boolean).length;
}

export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to submit content." }, { status: 401 });
  }

  // Rate limit: 5 submissions per hour per user
  const identity = session.user.id;
  const rl = rateLimit(identity, { windowMs: 60 * 60_000, maxRequests: 5 }, "community-submit");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many submissions. Please wait before submitting again." }, { status: 429 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { title, category, content, excerpt } = parsed.data;
  const wordCount = countWords(content);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const slug = generateSlug(title);

  // Category map to platform category
  const categoryMap: Record<string, string> = {
    web3: "web3-fundamentals",
    ai: "ai-tutorials",
    airdrop: "airdrop-guides",
    opinion: "opinion-news",
  };

  try {
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt ?? null,
        category: categoryMap[category] ?? category,
        tags: [],
        wordCount,
        readingTime,
        status: "PENDING_REVIEW",
        published: false,
        authorId: session.user.id,
        language: "en",
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({
      id: post.id,
      message: "Submitted for review",
    }, { status: 201 });
  } catch (err) {
    console.error("[community/submit] DB error:", err);
    return NextResponse.json({ error: "Failed to save submission. Please try again." }, { status: 500 });
  }
}

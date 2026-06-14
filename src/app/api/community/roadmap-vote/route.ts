import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { rateLimit, getClientIdentity, RATE_LIMIT_TIERS } from "@/lib/rate-limiter"

const voteSchema = z.object({
  featureId: z.string().min(1).max(50),
})

/**
 * POST /api/community/roadmap-vote
 * Body: { featureId: string }
 *
 * TODO: Save votes to DB once RoadmapItem model is added in a future migration.
 * For now returns a success stub so the UI integration can be wired up.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 20 votes per IP per hour
  const ip = getClientIdentity(request);
  const rl = rateLimit(ip, { windowMs: 60 * 60_000, maxRequests: 20 }, "roadmap-vote");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "featureId is required" }, { status: 422 });
  }

  // TODO: persist to DB
  // await prisma.roadmapVote.create({ data: { featureId, ip, votedAt: new Date() } })

  return NextResponse.json({
    success: true,
    featureId: parsed.data.featureId,
    message: "Vote recorded",
  });
}

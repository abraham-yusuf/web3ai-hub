import { prisma } from "@/lib/prisma"

/**
 * GET /api/health — lightweight health check for uptime monitors.
 *
 * Returns 200 if the app + database are healthy, 503 otherwise.
 * Safe to call from Sentry Crons, UptimeRobot, Pingdom, etc.
 */
export async function GET() {
  const start = Date.now()
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {}

  // Database connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    checks.database = { ok: true, ms: Date.now() - dbStart }
  } catch (e) {
    checks.database = { ok: false, error: String(e).slice(0, 120) }
  }

  const allOk = Object.values(checks).every((c) => c.ok)

  return Response.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      totalMs: Date.now() - start,
      checks,
    },
    { status: allOk ? 200 : 503 },
  )
}

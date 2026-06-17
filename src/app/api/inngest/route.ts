import { NextResponse } from "next/server"

// Inngest integration is defined but requires Turbopack compatibility fix.
// The inngest package (v4) uses ESM exports that Turbopack can't resolve.
//
// To re-enable when Turbopack adds support:
// 1. Remove this stub
// 2. Restore the original route below
// 3. Set INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY in Vercel env
// 4. Run: npx inngest-cli@latest sync --url https://ai3.web.id/api/inngest
//
// Alternative: switch Next.js to webpack bundler in next.config.ts
//   bundler: "webpack" (under experimental or top-level)

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(
    { status: "Inngest not active — Turbopack module resolution issue. See route.ts comments." },
    { status: 503 }
  )
}

export async function POST() {
  return GET()
}

export async function PUT() {
  return GET()
}

// --- ORIGINAL ROUTE (restore when Turbopack supports inngest) ---
// import { serve } from "inngest/next"
// import { inngest } from "@/lib/inngest/client"
// import { scheduledPublish } from "@/lib/inngest/functions/scheduled-publish"
// import { autoArchive } from "@/lib/inngest/functions/auto-archive"
// import { airdropReminders } from "@/lib/inngest/functions/airdrop-reminders"
//
// export const { GET, POST, PUT } = serve({
//   client: inngest,
//   functions: [scheduledPublish, autoArchive, airdropReminders],
// })

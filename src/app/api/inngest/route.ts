import { NextResponse } from "next/server"

// Inngest integration is defined but not actively configured for this deployment.
// The inngest functions (scheduled-publish, auto-archive, airdrop-reminders)
// are available when INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY are set.
// To enable: uncomment the serve() call below and set the env vars.

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(
    { status: "Inngest not configured. Set INNGEST_EVENT_KEY to enable." },
    { status: 503 }
  )
}

export async function POST() {
  return NextResponse.json(
    { status: "Inngest not configured. Set INNGEST_EVENT_KEY to enable." },
    { status: 503 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { status: "Inngest not configured. Set INNGEST_EVENT_KEY to enable." },
    { status: 503 }
  )
}

// To enable Inngest, uncomment below and set env vars:
//
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

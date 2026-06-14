import { NextRequest, NextResponse } from "next/server"

// POST - Save push subscription (stub — extend when backend is ready)
export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 })
    }

    // TODO: Save subscription to database for later push sends
    // await prisma.pushSubscription.upsert({
    //   where: { endpoint: subscription.endpoint },
    //   update: { keys: subscription.keys, updatedAt: new Date() },
    //   create: { endpoint: subscription.endpoint, keys: subscription.keys }
    // })

    console.log("Push subscription received:", subscription.endpoint)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Push subscribe error:", error)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }
}

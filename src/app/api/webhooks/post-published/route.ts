import { NextRequest, NextResponse } from "next/server"

// POST - Called after a post is published (via admin UI or cron)
// Sends a tweet announcement using the Twitter API (stub)
export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret
    const webhookSecret = request.headers.get("x-webhook-secret")
    const expectedSecret = "placeholder"

    if (expectedSecret && webhookSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const { postSlug, postTitle, postUrl } = body || {}

    if (!postTitle || !postUrl) {
      return NextResponse.json(
        { error: "postTitle and postUrl are required" },
        { status: 400 }
      )
    }

    console.log(`[webhook] Post published: ${postTitle} — ${postUrl}`)

    // TODO: Integrate Twitter API v2 for auto-posting
    // const tweetText = `🚀 New post on AI3 Hub:

${postTitle}

${postUrl}

#AI #Web3 #Crypto`
    // await fetch("https://api.twitter.com/2/tweets", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${"placeholder"}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ text: tweetText }),
    // })

    return NextResponse.json({ success: true, queued: true })
  } catch (error) {
    console.error("Webhook post-published error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}

// POST /api/payments/webhook — Midtrans/Stripe webhook handler
// Validates signature, upgrades user role/plan in DB
export async function POST(request: Request) {
  // TODO: Verify Midtrans notification_key or Stripe webhook secret
  const body = await request.json()
  console.log("[payment webhook]", body)
  return Response.json({ received: true })
}

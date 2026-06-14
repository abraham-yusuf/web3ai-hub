// POST /api/payments/create-checkout
// Body: { plan: "pro" | "enterprise", userId: string }
// TODO: Integrate Midtrans or Stripe
// Returns payment URL stub for now
export async function POST(request: Request) {
  const { plan, userId } = await request.json()
  // Stub: In production, create Midtrans Snap Token or Stripe Checkout Session
  return Response.json({
    success: true,
    paymentUrl: `https://payment.example.com/checkout?plan=${plan}&user=${userId}`,
    message: "Payment integration coming soon. Contact admin@ai3.web.id to upgrade manually."
  })
}

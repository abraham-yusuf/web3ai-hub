import { auth } from "@/auth"

export const metadata = {
  title: "Subscription Management — Admin",
}

export default async function SubscriptionsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage Pro and Enterprise subscribers, view MRR, churn, and LTV metrics.
        </p>
      </div>

      <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
        <strong>⚠️ Integration Pending:</strong> Stripe/Midtrans integration is not yet configured.
        Premium accounts are managed manually for now. Contact{" "}
        <a href="mailto:admin@ai3.web.id" className="underline underline-offset-2">
          admin@ai3.web.id
        </a>{" "}
        to upgrade a user account.
      </div>

      {/* Revenue KPIs (stub) */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Monthly Recurring Revenue", value: "Rp 0", note: "Payment not wired yet" },
          { label: "Active Subscribers", value: "0", note: "Pro + Enterprise" },
          { label: "Churn Rate", value: "—", note: "Requires payment data" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-3xl font-bold tabular-nums mt-1">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.note}</p>
          </div>
        ))}
      </div>

      {/* Subscriber table stub */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Subscribers</h2>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          <p className="font-medium">No subscription data available</p>
          <p className="text-sm mt-1">
            Connect a payment provider (Midtrans or Stripe) to view subscription data here.
          </p>
          <a
            href="/docs/MIGRATION_NOTES.md"
            className="mt-3 inline-block text-sm text-primary underline underline-offset-2"
          >
            View migration notes →
          </a>
        </div>
      </div>

      {/* TODO list for implementation */}
      <div className="rounded-xl border p-6 space-y-2">
        <h3 className="font-semibold text-sm">Implementation Checklist</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>☐ Configure Midtrans Snap or Stripe Checkout in <code>/api/payments/create-checkout</code></li>
          <li>☐ Verify webhook signatures in <code>/api/payments/webhook</code></li>
          <li>☐ Run Prisma migration: <code>add_subscription_table</code></li>
          <li>☐ Update <code>getUserTier()</code> in <code>src/lib/subscription.ts</code> to query DB</li>
          <li>☐ Wire <code>UpgradeCta</code> component to gated features</li>
        </ul>
      </div>
    </div>
  )
}

# Migration Notes

This file tracks pending Prisma schema changes that should be applied with the next migration run.

---

## Step 16 — Sponsored Content Fields

The following fields need to be added to the Prisma schema to support sponsored/native ad content:

```prisma
model Post {
  // ... existing fields ...
  sponsored Boolean @default(false)
}

model Airdrop {
  // ... existing fields ...
  sponsored Boolean @default(false)
}
```

**Migration command (when ready):**
```bash
npx prisma migrate dev --name add_sponsored_fields
```

---

## Step 15 — Subscription Table

When Midtrans or Stripe integration is wired up, add a `Subscription` model:

```prisma
model Subscription {
  id               String    @id @default(cuid())
  userId           String    @unique
  tier             String    @default("free")   // "free" | "pro" | "enterprise"
  status           String    @default("active") // "active" | "cancelled" | "past_due"
  externalId       String?   // Midtrans order_id or Stripe subscription_id
  currentPeriodEnd DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Migration command (when ready):**
```bash
npx prisma migrate dev --name add_subscription_table
```

---

## Notes

- Do **not** run these migrations in production until payment provider (Midtrans/Stripe) is fully configured.
- Coordinate `sponsored` field rollout with the admin UI update to set/unset sponsored flags.
- See `src/lib/subscription.ts` for tier definitions and helper functions.

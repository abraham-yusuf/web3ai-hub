/**
 * Prisma CRUD integration tests.
 *
 * These hit a real database (via DATABASE_URL) to verify the data layer end to end.
 * Every mutating test runs inside an interactive transaction that is ALWAYS rolled
 * back (a sentinel Rollback error is thrown at the end), so the tests never persist
 * or mutate any data — safe to run against shared/staging databases.
 *
 * When DATABASE_URL is not set (e.g. CI without a DB), the tests skip cleanly.
 */
import test from "node:test"
import assert from "node:assert/strict"
import { PrismaClient } from "@prisma/client"

const hasDb = Boolean(process.env.DATABASE_URL)
const prisma = hasDb ? new PrismaClient() : null
const skip = hasDb ? false : "DATABASE_URL not set — skipping DB integration tests"

class Rollback extends Error {}

async function rolledBack(fn: (tx: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]) => Promise<void>) {
  const db = prisma as PrismaClient
  await db
    .$transaction(async (tx) => {
      await fn(tx)
      throw new Rollback() // force rollback: nothing this test did is ever committed
    })
    .catch((e) => {
      if (!(e instanceof Rollback)) throw e
    })
}

test("AITool: full CRUD round-trip (transaction rolled back)", { skip }, async () => {
  const db = prisma as PrismaClient
  const slug = `viktor-itest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  await rolledBack(async (tx) => {
    // CREATE
    const created = await tx.aITool.create({
      data: {
        name: "Viktor Integration Test Tool",
        slug,
        description: "Temporary record created by an integration test.",
        category: "Testing",
        pricing: "Free",
        pricingType: "FREE",
        features: ["alpha", "beta"],
        platforms: ["web"],
        rating: 4.2,
      },
    })
    assert.ok(created.id, "create returns an id")
    assert.equal(created.slug, slug)
    assert.equal(created.pricingType, "FREE")
    assert.equal(created.sponsored, false, "default sponsored=false applied")

    // READ
    const read = await tx.aITool.findUnique({ where: { id: created.id } })
    assert.equal(read?.name, "Viktor Integration Test Tool")
    assert.deepEqual(read?.features, ["alpha", "beta"])

    // READ via unique slug
    const bySlug = await tx.aITool.findUnique({ where: { slug } })
    assert.equal(bySlug?.id, created.id)

    // UPDATE
    const updated = await tx.aITool.update({
      where: { id: created.id },
      data: { rating: 4.9, sponsored: true },
    })
    assert.equal(updated.rating, 4.9)
    assert.equal(updated.sponsored, true)

    // LIST / filter (mirrors the ai-tools page WHERE usage)
    const list = await tx.aITool.findMany({ where: { AND: [{ slug }, { sponsored: true }] } })
    assert.equal(list.length, 1)

    // DELETE
    await tx.aITool.delete({ where: { id: created.id } })
    const gone = await tx.aITool.findUnique({ where: { id: created.id } })
    assert.equal(gone, null, "record removed within the transaction")
  })

  // Verify rollback: the slug must not exist outside the transaction.
  const persisted = await db.aITool.findUnique({ where: { slug } })
  assert.equal(persisted, null, "transaction rolled back — no test data persisted")
})

test("AITool: facet aggregation queries (read-only, mirrors cached facets)", { skip }, async () => {
  const db = prisma as PrismaClient
  const facets = await db.aITool.groupBy({
    by: ["category"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })
  assert.ok(Array.isArray(facets), "groupBy returns an array")
  for (const f of facets) {
    assert.equal(typeof f.category, "string")
    assert.ok(f._count.id >= 0)
  }
  const total = await db.aITool.count()
  assert.ok(total >= 0, "count returns a non-negative number")
})

test("AITool: unique slug constraint is enforced (rolled back)", { skip }, async () => {
  const slug = `viktor-itest-uniq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await rolledBack(async (tx) => {
    const base = {
      name: "Uniq Test",
      description: "dup slug test",
      category: "Testing",
      pricing: "Free" as const,
    }
    await tx.aITool.create({ data: { ...base, slug } })
    await assert.rejects(
      () => tx.aITool.create({ data: { ...base, slug } }),
      "duplicate slug should violate the @unique constraint",
    )
  })
})

test.after(async () => {
  if (prisma) await prisma.$disconnect()
})

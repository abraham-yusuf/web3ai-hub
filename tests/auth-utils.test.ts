import assert from "node:assert/strict"
import test from "node:test"
import { hashPassword, verifyPassword } from "../src/lib/auth-utils"

test("hashPassword stores passwords in the expected scrypt wrapper format", async () => {
  const hash = await hashPassword("correct horse battery staple")

  assert.match(hash, /^\$2b\$[a-f0-9]{32}\$[a-f0-9]{128}$/)
  assert.notEqual(hash, "correct horse battery staple")
})

test("verifyPassword accepts matching passwords and rejects mismatches", async () => {
  const hash = await hashPassword("admin-password-123")

  assert.equal(await verifyPassword("admin-password-123", hash), true)
  assert.equal(await verifyPassword("wrong-password", hash), false)
  assert.equal(await verifyPassword("admin-password-123", "plaintext"), false)
})

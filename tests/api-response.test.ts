import assert from "node:assert/strict"
import test from "node:test"
import { z } from "zod"
import { AppError, ForbiddenError, apiErrorResponse, apiSuccessResponse } from "../src/lib/api-response"

const originalConsoleError = console.error

test.before(() => {
  console.error = () => undefined
})

test.after(() => {
  console.error = originalConsoleError
})

test("apiSuccessResponse serializes data with a configurable status", async () => {
  const response = apiSuccessResponse({ ok: true }, 201)

  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { ok: true })
})

test("apiErrorResponse maps AppError subclasses to status and code", async () => {
  const response = apiErrorResponse(new ForbiddenError(), "test")

  assert.equal(response.status, 403)
  assert.deepEqual(await response.json(), { error: "Akses ditolak", code: "FORBIDDEN" })
})

test("apiErrorResponse maps ZodError to validation response", async () => {
  const parsed = z.object({ title: z.string().min(3) }).safeParse({ title: "x" })
  assert.equal(parsed.success, false)

  const response = apiErrorResponse(parsed.error, "test")
  const body = await response.json()

  assert.equal(response.status, 400)
  assert.equal(body.error, "Validasi gagal")
  assert.equal(body.code, "VALIDATION_ERROR")
  assert.ok(body.details.fieldErrors.title)
})

test("apiErrorResponse falls back to internal errors for unknown exceptions", async () => {
  const response = apiErrorResponse(new AppError("Custom", 418, "TEAPOT"), "test")

  assert.equal(response.status, 418)
  assert.deepEqual(await response.json(), { error: "Custom", code: "TEAPOT" })
})

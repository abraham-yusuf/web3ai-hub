import { ZodError } from "zod"

export interface ApiErrorBody {
  error: string
  code?: string
  details?: unknown
}

/**
 * Standardized API error response handler.
 * Use this in ALL route handlers for consistent error shape.
 */
export function apiErrorResponse(error: unknown, context: string): Response {
  console.error(`[${context}]`, error)

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Validasi gagal",
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      } satisfies ApiErrorBody,
      { status: 400 },
    )
  }

  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
      } satisfies ApiErrorBody,
      { status: error.statusCode },
    )
  }

  if (isPrismaError(error)) {
    const prismaResponse = handlePrismaError(error)
    return Response.json(prismaResponse.body, { status: prismaResponse.status })
  }

  return Response.json(
    {
      error: "Terjadi kesalahan server",
      code: "INTERNAL_ERROR",
    } satisfies ApiErrorBody,
    { status: 500 },
  )
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = "APP_ERROR",
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} tidak ditemukan`, 404, "NOT_FOUND")
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED")
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Akses ditolak") {
    super(message, 403, "FORBIDDEN")
  }
}

export class RateLimitError extends AppError {
  constructor(resetAt?: number) {
    super(`Rate limit exceeded${resetAt ? `. Reset at ${new Date(resetAt).toISOString()}` : ""}`, 429, "RATE_LIMITED")
  }
}

interface PrismaKnownError {
  code: string
  meta?: Record<string, unknown>
}

function isPrismaError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as PrismaKnownError).code === "string" &&
    (error as PrismaKnownError).code.startsWith("P")
  )
}

function handlePrismaError(error: PrismaKnownError): { body: ApiErrorBody; status: number } {
  switch (error.code) {
    case "P2002":
      return {
        body: { error: "Data sudah ada (duplicate)", code: "DUPLICATE" },
        status: 409,
      }
    case "P2025":
      return {
        body: { error: "Data tidak ditemukan", code: "NOT_FOUND" },
        status: 404,
      }
    default:
      return {
        body: { error: "Database error", code: `DB_${error.code}` },
        status: 500,
      }
  }
}

export function apiSuccessResponse<T>(data: T, status = 200): Response {
  return Response.json(data, { status })
}

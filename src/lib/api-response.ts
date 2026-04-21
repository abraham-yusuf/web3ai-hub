import { ZodError } from "zod"

export function apiErrorResponse(error: unknown, context: string): Response {
  console.error(`[${context}]`, error)

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Validasi gagal",
        details: error.flatten(),
      },
      { status: 400 },
    )
  }

  return Response.json(
    {
      error: "Terjadi kesalahan server",
    },
    { status: 500 },
  )
}

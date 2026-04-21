"use client"

import "./globals.css"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm font-medium text-destructive">500</p>
          <h1 className="mt-2 text-2xl font-bold">Terjadi kesalahan sistem</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Silakan coba lagi dalam beberapa saat. Jika masalah berlanjut, hubungi admin.
          </p>
          {error.digest ? (
            <p className="mt-3 text-xs text-muted-foreground">Error digest: {error.digest}</p>
          ) : null}
          <button
            onClick={() => unstable_retry()}
            className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  )
}

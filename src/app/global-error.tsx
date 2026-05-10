"use client"

import "./globals.css"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <title>500 — Web3AI Hub</title>
        <main className="w-full max-w-2xl overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="border-b bg-destructive/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-medium text-destructive">500 — Fatal error</p>
                <h1 className="text-2xl font-bold tracking-tight">Web3AI Hub tidak bisa dimuat</h1>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            <p className="text-sm text-muted-foreground">
              Root layout mengalami error tak terduga. Coba muat ulang aplikasi. Jika masih terjadi, kirim digest berikut ke tim teknis.
            </p>
            {error.digest ? (
              <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Error digest: <span className="font-mono">{error.digest}</span>
              </p>
            ) : null}
            <button
              onClick={() => unstable_retry()}
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Coba Lagi
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}

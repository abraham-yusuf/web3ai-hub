"use client"

import Link from "next/link"
import { useEffect } from "react"
import { AlertTriangle, Home, RefreshCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[app-error-boundary]", error)
  }, [error])

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-12">
      <div className="w-full overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="border-b bg-destructive/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-destructive">500 — Application error</p>
              <h1 className="text-2xl font-bold tracking-tight">Ada bagian halaman yang gagal dimuat</h1>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <p className="text-muted-foreground">
            Sistem menangkap error tak terduga. Kamu bisa mencoba memuat ulang segmen ini, kembali ke home, atau mencari konten lain.
          </p>
          {error.digest ? (
            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              Error digest untuk tim teknis: <span className="font-mono">{error.digest}</span>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => unstable_retry()}>
              <RefreshCcw className="mr-1 h-4 w-4" />
              Coba Lagi
            </Button>
            <Link href="/" className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
              <Home className="mr-1 h-4 w-4" />
              Home
            </Link>
            <Link href="/search" className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
              <Search className="mr-1 h-4 w-4" />
              Search
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useEffect } from "react"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PublicError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[public-error-boundary]", error)
  }, [error])

  return (
    <section className="mx-auto flex min-h-[55vh] max-w-2xl items-center justify-center py-10">
      <div className="w-full rounded-3xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-7 w-7" />
        </div>
        <p className="mt-5 text-sm font-medium text-destructive">Konten gagal dimuat</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Terjadi kendala saat membuka halaman</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Silakan coba lagi. Kamu juga bisa kembali ke pusat konten untuk memilih modul lain.
        </p>
        {error.digest ? <p className="mt-3 text-xs text-muted-foreground">Digest: <span className="font-mono">{error.digest}</span></p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => unstable_retry()}>
            <RefreshCcw className="mr-1 h-4 w-4" />
            Coba Lagi
          </Button>
          <Link href="/learn" className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
            Buka Learn
          </Link>
          <Link href="/search" className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
            Cari Konten
          </Link>
        </div>
      </div>
    </section>
  )
}

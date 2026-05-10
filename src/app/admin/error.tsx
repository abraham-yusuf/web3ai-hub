"use client"

import Link from "next/link"
import { useEffect } from "react"
import { ShieldAlert, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[admin-error-boundary]", error)
  }, [error])

  return (
    <section className="mx-auto flex min-h-[55vh] max-w-2xl items-center justify-center py-10">
      <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-destructive">Admin error</p>
              <h1 className="text-2xl font-bold tracking-tight">Operasi admin gagal dimuat</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Coba lagi untuk memuat ulang data dashboard. Jika masih gagal, cek koneksi database, session admin, atau konfigurasi provider terkait.
            </p>
            {error.digest ? <p className="text-xs text-muted-foreground">Digest: <span className="font-mono">{error.digest}</span></p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => unstable_retry()}>
                <RefreshCcw className="mr-1 h-4 w-4" />
                Retry
              </Button>
              <Link href="/admin" className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

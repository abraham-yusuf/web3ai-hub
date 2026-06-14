"use client"

import Link from "next/link"
import { Zap } from "lucide-react"

interface UpgradeCtaProps {
  /** Human-readable name of the gated feature, e.g. "AI Writer unlimited" */
  feature: string
  className?: string
}

export function UpgradeCta({ feature, className = "" }: UpgradeCtaProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-primary/20",
        "bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center",
        className,
      ].join(" ")}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Zap className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Fitur Premium</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          <span className="font-medium text-foreground">{feature}</span> tersedia untuk pengguna
          Pro dan Enterprise. Upgrade sekarang untuk membuka akses penuh.
        </p>
      </div>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Zap className="h-4 w-4" />
        Upgrade ke Pro
      </Link>
      <p className="text-xs text-muted-foreground">
        Mulai dari Rp 49.000/bulan · Batalkan kapan saja
      </p>
    </div>
  )
}

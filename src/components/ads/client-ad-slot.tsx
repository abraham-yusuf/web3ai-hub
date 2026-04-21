"use client"

import { useEffect } from "react"

type ClientAdSlotProps = {
  clientId: string
  slotId: string
  format?: "auto" | "rectangle" | "horizontal"
  className?: string
}

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export function ClientAdSlot({ clientId, slotId, format = "auto", className }: ClientAdSlotProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // ignore ads push runtime errors in non-ads environments
    }
  }, [slotId])

  return (
    <ins
      className={`adsbygoogle block min-h-[90px] rounded-md border border-dashed border-muted-foreground/30 ${className ?? ""}`}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
      aria-label="Advertisement"
    />
  )
}

"use client"

import { useEffect } from "react"

type EventParams = Record<string, string | number | boolean | undefined>

type TrackEventOnMountProps = {
  name: string
  params?: EventParams
  enabled?: boolean
}

export function TrackEventOnMount({ name, params = {}, enabled = true }: TrackEventOnMountProps) {
  useEffect(() => {
    if (!enabled) return
    window.web3aiTrackEvent?.(name, params)
  }, [enabled, name, params])

  return null
}

"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useReportWebVitals } from "next/web-vitals"
import Script from "next/script"
import { Suspense, useEffect } from "react"

type GtagCommand = "config" | "event" | "js"
type GtagParams = Record<string, string | number | boolean | Date | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (command: GtagCommand, target: string | Date, params?: GtagParams) => void
    web3aiTrackEvent?: (name: string, params?: GtagParams) => void
  }
}

type GoogleAnalyticsProps = {
  measurementId?: string
}

function sendGAEvent(name: string, params: GtagParams = {}) {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("event", name, params)
}

function RouteAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    window.gtag?.("config", measurementId, {
      page_path: pagePath,
      send_page_view: false,
    })

    sendGAEvent("page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [measurementId, pathname, searchParams])

  useEffect(() => {
    window.web3aiTrackEvent = sendGAEvent
    return () => {
      delete window.web3aiTrackEvent
    }
  }, [])

  return null
}

function WebVitalsAnalytics() {
  useReportWebVitals((metric) => {
    sendGAEvent(metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      non_interaction: true,
      metric_rating: metric.rating,
      metric_delta: metric.delta,
    })
  })

  return null
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(measurementId)}, { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <RouteAnalytics measurementId={measurementId} />
      </Suspense>
      <WebVitalsAnalytics />
    </>
  )
}

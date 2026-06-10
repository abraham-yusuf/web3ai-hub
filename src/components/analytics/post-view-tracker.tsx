"use client"

import { useEffect, useRef } from "react"

interface PostViewTrackerProps {
  postId: string
}

/**
 * Client component — fires view tracking API on mount, tracks reading time on unload.
 * No sessionStorage — each page load is a separate session for anonymity.
 * Authenticated user tracking can be added by passing userId as prop from server component.
 */
export function PostViewTracker({ postId }: PostViewTrackerProps) {
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    startTimeRef.current = Date.now()

    // Generate a per-load session ID (no persistence for anonymity)
    const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36)

    // Fire tracking request
    const track = async () => {
      try {
        await fetch(`/api/analytics/posts/${postId}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
      } catch {
        // Silently ignore tracking errors
      }
    }

    track()

    // Track reading time on page leave
    const handleUnload = () => {
      const readingTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
      if (readingTime > 5) {
        const body = JSON.stringify({ sessionId, readingTime })
        navigator.sendBeacon?.(
          `/api/analytics/posts/${postId}/view`,
          body
        )
      }
    }

    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [postId])

  return null
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

type PermissionState = "default" | "granted" | "denied"

export function PushNotificationButton() {
  const [permission, setPermission] = useState<PermissionState>("default")
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    setIsSupported(supported)
    if (supported) {
      setPermission(Notification.permission as PermissionState)
    }
  }, [])

  async function enableNotifications() {
    if (!isSupported) return
    setIsLoading(true)
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      await navigator.serviceWorker.ready

      // Request permission
      const result = await Notification.requestPermission()
      setPermission(result as PermissionState)

      if (result === "granted") {
        // Subscribe to push
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: "placeholder",
          })

          // Send subscription to server
          await fetch("/api/notifications/push-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          })
        } catch (subError) {
          console.warn("Push subscription failed (VAPID key may not be set):", subError)
        }
      }
    } catch (error) {
      console.error("Service worker registration failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) return null

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-green-500">🔔</span>
        Notifikasi aktif
      </div>
    )
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>🔕</span>
        Notifikasi diblokir
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={enableNotifications}
      disabled={isLoading}
      className="gap-2"
    >
      <span>🔔</span>
      {isLoading ? "Mengaktifkan..." : "Aktifkan Notifikasi"}
    </Button>
  )
}

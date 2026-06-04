"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Loader2, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  airdropId?: string
}

interface NotificationsPageProps {
  userId?: string
}

interface GroupedNotifications {
  today: Notification[]
  yesterday: Notification[]
  thisWeek: Notification[]
  older: Notification[]
}

function groupNotifications(notifications: Notification[]): GroupedNotifications {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const thisWeekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const grouped: GroupedNotifications = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  }

  for (const notification of notifications) {
    const notifDate = new Date(notification.createdAt)
    
    if (notifDate >= today) {
      grouped.today.push(notification)
    } else if (notifDate >= yesterday) {
      grouped.yesterday.push(notification)
    } else if (notifDate >= thisWeekStart) {
      grouped.thisWeek.push(notification)
    } else {
      grouped.older.push(notification)
    }
  }

  return grouped
}

export function NotificationsPage({ userId }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  async function fetchNotifications() {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/notifications", {
        headers: { "x-user-id": userId },
      })

      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  async function markAsRead(notificationId: string) {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { "x-user-id": userId || "" },
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
      }
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
    if (unreadIds.length === 0) return

    setMarkingAllRead(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId || "",
        },
        body: JSON.stringify({ ids: unreadIds }),
      })

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const grouped = groupNotifications(notifications)

  const typeColors: Record<string, string> = {
    deadline: "bg-red-500/10 text-red-600 border-red-500/20",
    reminder: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    xp_earned: "bg-green-500/10 text-green-600 border-green-500/20",
  }

  if (!userId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
          <p className="text-muted-foreground mb-4">
            Please sign in to view your notifications
          </p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const hasNotifications = notifications.length > 0

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={markingAllRead}
          >
            {markingAllRead ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {!hasNotifications ? (
        <div className="text-center py-12 rounded-xl border border-dashed">
          <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">
            When you receive notifications, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          {grouped.today.length > 0 && (
            <NotificationGroup
              title="Today"
              notifications={grouped.today}
              typeColors={typeColors}
              formatTime={formatTime}
              onMarkAsRead={markAsRead}
            />
          )}

          {/* Yesterday */}
          {grouped.yesterday.length > 0 && (
            <NotificationGroup
              title="Yesterday"
              notifications={grouped.yesterday}
              typeColors={typeColors}
              formatTime={formatTime}
              onMarkAsRead={markAsRead}
            />
          )}

          {/* This Week */}
          {grouped.thisWeek.length > 0 && (
            <NotificationGroup
              title="This Week"
              notifications={grouped.thisWeek}
              typeColors={typeColors}
              formatTime={formatDate}
              onMarkAsRead={markAsRead}
            />
          )}

          {/* Older */}
          {grouped.older.length > 0 && (
            <NotificationGroup
              title="Older"
              notifications={grouped.older}
              typeColors={typeColors}
              formatTime={formatDate}
              onMarkAsRead={markAsRead}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface NotificationGroupProps {
  title: string
  notifications: Notification[]
  typeColors: Record<string, string>
  formatTime: (date: string) => string
  onMarkAsRead: (id: string) => void
}

function NotificationGroup({
  title,
  notifications,
  typeColors,
  formatTime,
  onMarkAsRead,
}: NotificationGroupProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      <div className="rounded-lg border bg-card">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-start gap-4 p-4 transition-colors",
              !notification.isRead && "bg-muted/50",
              index < notifications.length - 1 && "border-b"
            )}
          >
            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
            )}
            {notification.isRead && <div className="w-2 shrink-0" />}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn("text-sm", !notification.isRead && "font-medium")}>
                  {notification.title}
                </p>
                <Badge
                  variant="outline"
                  className={cn("text-xs px-1.5 py-0", typeColors[notification.type])}
                >
                  {notification.type.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(notification.createdAt)}
              </p>
            </div>

            {/* Actions */}
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMarkAsRead(notification.id)}
                className="shrink-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
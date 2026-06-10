"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  toolId: string
  toolSlug: string
  initialBookmarked?: boolean
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

export function BookmarkButton({
  toolId,
  toolSlug,
  initialBookmarked = false,
  className,
  size = "default",
  showText = true,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleBookmark = async () => {
    // Optimistic update
    const previousState = isBookmarked
    setIsBookmarked(!isBookmarked)
    setIsLoading(true)

    try {
      const method = previousState ? "DELETE" : "POST"
      const url = previousState
        ? `/api/tools/bookmarks?toolId=${toolId}`
        : "/api/tools/bookmarks"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method === "POST" ? JSON.stringify({ toolId }) : undefined,
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 401) {
          // Redirect to login or show login modal
          router.push("/admin/login")
          return
        }
        throw new Error(data.error || "Failed to update bookmark")
      }

      // Revalidate the tool page to update bookmark counts
      router.refresh()
    } catch (error) {
      // Revert optimistic update
      setIsBookmarked(previousState)
      console.error("Bookmark error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={cn(
        buttonVariants({
          variant: isBookmarked ? "default" : "outline",
          size,
        }),
        isBookmarked && "bg-primary text-primary-foreground",
        className
      )}
    >
      <Bookmark
        className={cn(
          "h-4 w-4",
          size === "icon" ? "" : "mr-2",
          isBookmarked && "fill-current"
        )}
      />
      {showText && (isBookmarked ? "Bookmarked" : "Bookmark")}
    </button>
  )
}
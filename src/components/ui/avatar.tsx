"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-xl",
}

export function Avatar({ src, alt = "", fallback, className, size = "md" }: AvatarProps) {
  const [broken, setBroken] = React.useState(false)

  if (!src || broken) {
    return (
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full bg-slate-700 font-medium text-slate-200",
          sizeClasses[size],
          className,
        )}
      >
        {fallback ? fallback.slice(0, 2).toUpperCase() : "?"}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-slate-700 object-cover",
        sizeClasses[size],
        className,
      )}
    />
  )
}
"use client"

import { Button } from "@/components/ui/button"

interface ConfirmDeleteButtonProps {
  message: string
  children?: React.ReactNode
  className?: string
  variant?: "destructive" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

/**
 * A delete button that shows a confirmation dialog before submitting.
 * Use inside a <form> with a server action — this client component exists
 * solely to handle the onClick/confirm interaction that Server Components
 * cannot use.
 */
export function ConfirmDeleteButton({
  message,
  children = "Delete",
  className,
  variant = "destructive",
  size = "sm",
}: ConfirmDeleteButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) {
          e.preventDefault()
        }
      }}
    >
      {children}
    </Button>
  )
}

/**
 * A plain HTML confirm-delete button (no shadcn Button dependency).
 * Use for non-shadcn delete buttons (e.g., SEO topics page).
 */
export function ConfirmDeleteButtonPlain({
  message,
  children = "Delete",
  className,
}: {
  message: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) {
          e.preventDefault()
        }
      }}
    >
      {children}
    </button>
  )
}

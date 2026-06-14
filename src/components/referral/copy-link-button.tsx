"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface CopyLinkButtonProps {
  text: string
  label?: string
}

export function CopyLinkButton({ text, label = "Salin" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea")
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      variant={copied ? "default" : "outline"}
      size="sm"
      onClick={handleCopy}
      className="shrink-0 transition-all"
    >
      {copied ? "✓ Disalin!" : label}
    </Button>
  )
}

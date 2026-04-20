"use client"

import { Button } from "@/components/ui/button"
import { Check, Copy, Send, Share2 } from "lucide-react"
import { useState } from "react"

interface ShareButtonsProps {
  title: string
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleShare = async (platform: "x" | "telegram" | "copy") => {
    const pageUrl = window.location.href

    if (platform === "copy") {
      await navigator.clipboard.writeText(pageUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      return
    }

    const encodedTitle = encodeURIComponent(title)
    const encodedUrl = encodeURIComponent(pageUrl)

    const shareUrl =
      platform === "x"
        ? `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
        : `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`

    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => handleShare("x")}>
        <Share2 className="mr-2 h-4 w-4" />
        Share X
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleShare("telegram")}>
        <Send className="mr-2 h-4 w-4" />
        Telegram
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
        {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
        {isCopied ? "Copied" : "Copy link"}
      </Button>
    </div>
  )
}

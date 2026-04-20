"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface SlugFieldProps {
  initialSlug?: string
  initialTitle?: string
  postId?: string
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function SlugField({ initialSlug = "", initialTitle = "", postId }: SlugFieldProps) {
  const [slug, setSlug] = useState(initialSlug || (initialTitle ? toSlug(initialTitle) : ""))
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")

  const checkSlug = async () => {
    if (!slug.trim()) {
      setStatus("idle")
      return
    }

    setStatus("checking")
    const params = new URLSearchParams({ slug })
    if (postId) params.set("excludeId", postId)

    const response = await fetch(`/api/admin/posts/slug-check?${params.toString()}`)
    const data = (await response.json()) as { available?: boolean }
    setStatus(data.available ? "available" : "taken")
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="slug-artikel" required />
        <Button type="button" variant="outline" onClick={checkSlug}>
          Check
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {status === "checking" && "Checking slug..."}
        {status === "available" && "Slug tersedia"}
        {status === "taken" && "Slug sudah dipakai"}
        {status === "idle" && "Gunakan huruf kecil dan tanda hubung."}
      </p>
    </div>
  )
}

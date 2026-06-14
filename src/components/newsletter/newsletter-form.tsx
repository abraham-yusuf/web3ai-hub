"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(data.message || "Berhasil subscribe!")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Gagal subscribe, coba lagi.")
      }
    } catch {
      setStatus("error")
      setMessage("Terjadi kesalahan, coba lagi.")
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 text-center py-4">
        <span className="text-3xl">🎉</span>
        <p className="text-green-600 dark:text-green-400 font-medium">{message}</p>
        <button
          className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          onClick={() => setStatus("idle")}
        >
          Subscribe email lain
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <Input
        type="email"
        placeholder="email@kamu.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === "loading"}
        className="flex-1"
        aria-label="Alamat email"
      />
      <Button type="submit" disabled={status === "loading" || !email} className="shrink-0">
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </Button>
      {status === "error" && (
        <p className="w-full text-sm text-destructive mt-1">{message}</p>
      )}
    </form>
  )
}

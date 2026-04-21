"use client"

import { useState } from "react"

type ReportIssueFormProps = {
  slug: string
}

export function ReportIssueForm({ slug }: ReportIssueFormProps) {
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")

  async function submit() {
    if (!message.trim()) return

    setStatus("sending")
    try {
      const response = await fetch("/api/airdrop/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, message }),
      })

      if (!response.ok) {
        throw new Error("Request failed")
      }

      setStatus("done")
      setMessage("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="space-y-2 rounded-xl border p-4">
      <h3 className="font-semibold">Report issue / scam</h3>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Laporkan masalah pada listing ini..."
        className="min-h-20 w-full rounded-md border bg-background p-2 text-sm"
      />
      <button
        type="button"
        onClick={() => void submit()}
        className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
      >
        {status === "sending" ? "Sending..." : "Kirim Laporan"}
      </button>
      {status === "done" && <p className="text-xs text-emerald-600">Terima kasih, laporan diterima.</p>}
      {status === "error" && <p className="text-xs text-destructive">Gagal mengirim laporan.</p>}
    </div>
  )
}

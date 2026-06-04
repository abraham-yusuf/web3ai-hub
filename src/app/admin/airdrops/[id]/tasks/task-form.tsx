"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TaskFormProps {
  airdropId: string
}

export function TaskForm({ airdropId }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSuccess(false)
    try {
      const res = await fetch("/api/airdrop/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airdropId,
          title: formData.get("title"),
          description: formData.get("description") || undefined,
          type: formData.get("type"),
          xpReward: parseInt(formData.get("xpReward") as string) || 10,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        window.location.reload()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          name="title"
          placeholder="Task title (e.g. Follow Twitter)"
          required
          className="h-9"
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <Input
          name="description"
          placeholder="Description (optional)"
          className="h-9"
        />
      </div>
      <div className="w-28">
        <select
          name="type"
          defaultValue="social"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="social">Social</option>
          <option value="defi">DeFi</option>
          <option value="testnet">Testnet</option>
          <option value="bridge">Bridge</option>
          <option value="swap">Swap</option>
        </select>
      </div>
      <div className="w-20">
        <Input
          name="xpReward"
          type="number"
          defaultValue="10"
          min="1"
          max="1000"
          className="h-9"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Adding..." : "Add Task"}
      </Button>
      {success && <span className="text-sm text-green-600">✅ Added!</span>}
    </form>
  )
}
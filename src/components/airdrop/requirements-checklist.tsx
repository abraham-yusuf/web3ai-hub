"use client"

import { useMemo, useState } from "react"

type RequirementsChecklistProps = {
  slug: string
  requirements: string[]
}

export function RequirementsChecklist({ slug, requirements }: RequirementsChecklistProps) {
  const key = useMemo(() => `airdrop-requirements-${slug}`, [slug])
  const [checked, setChecked] = useState<number[]>(() => {
    if (typeof window === "undefined") return []
    const raw = window.localStorage.getItem(key)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((item): item is number => typeof item === "number") : []
    } catch {
      return []
    }
  })

  function toggle(index: number) {
    const next = checked.includes(index) ? checked.filter((item) => item !== index) : [...checked, index]
    setChecked(next)
    window.localStorage.setItem(key, JSON.stringify(next))
  }

  return (
    <div className="space-y-2">
      {requirements.map((requirement, index) => (
        <label key={requirement} className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={checked.includes(index)} onChange={() => toggle(index)} />
          <span>{requirement}</span>
        </label>
      ))}
    </div>
  )
}

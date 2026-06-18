"use client"

type SortSelectProps = {
  defaultValue: string
  options: { value: string; label: string }[]
  /** Current filter state for preserving params on sort change */
  currentParams: Record<string, string | undefined>
}

export function SortSelect({ defaultValue, options, currentParams }: SortSelectProps) {
  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      className="h-10 rounded-md border bg-background px-3 text-sm"
      onChange={(e) => {
        const params = new URLSearchParams()
        params.set("sort", e.target.value)
        for (const [k, v] of Object.entries(currentParams)) {
          if (v && v !== "false" && v !== "") params.set(k, v)
        }
        window.location.href = `/ai-tools?${params.toString()}`
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

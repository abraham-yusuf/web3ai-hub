"use client"

/**
 * A `<select>` that navigates to a new URL on change.
 * Use inside Server Component pages where inline `onChange` is forbidden.
 */
type NavSelectProps = {
  /** Current value */
  value: string
  /** Build target URL from the selected value */
  buildHref: (value: string) => string
  className?: string
  children: React.ReactNode
}

export function NavSelect({ value, buildHref, className, children }: NavSelectProps) {
  return (
    <select
      value={value}
      className={className}
      onChange={(e) => {
        window.location.href = buildHref(e.target.value)
      }}
    >
      {children}
    </select>
  )
}

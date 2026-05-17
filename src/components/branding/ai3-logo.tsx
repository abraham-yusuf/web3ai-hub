import { cn } from "@/lib/utils"

type AI3LogoProps = {
  className?: string
  showWordmark?: boolean
}

export function AI3Logo({ className, showWordmark = true }: AI3LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        aria-hidden="true"
        className="h-8 w-8 shrink-0"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--primary)" />
        <path
          d="M24 13.5L31.8 27H16.2L24 13.5Z"
          fill="none"
          stroke="white"
          strokeWidth="2.75"
          strokeLinejoin="round"
        />
        <path d="M18.5 33H29.5" stroke="var(--secondary)" strokeWidth="2.75" strokeLinecap="round" />
      </svg>
      {showWordmark ? (
        <span className="bg-clip-text text-xl font-bold tracking-tight text-transparent" style={{ backgroundImage: "var(--brand-gradient)" }}>
          AI3
        </span>
      ) : null}
    </span>
  )
}

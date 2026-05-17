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
        <defs>
          <linearGradient id="ai3-logo-gradient" x1="6" y1="42" x2="42" y2="8" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai3-logo-gradient)" />
        <path
          d="M24 13.5L31.8 27H16.2L24 13.5Z"
          fill="none"
          stroke="white"
          strokeWidth="2.75"
          strokeLinejoin="round"
        />
        <path d="M18.5 33H29.5" stroke="white" strokeWidth="2.75" strokeLinecap="round" />
      </svg>
      {showWordmark ? (
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold tracking-tight text-transparent">
          AI3
        </span>
      ) : null}
    </span>
  )
}

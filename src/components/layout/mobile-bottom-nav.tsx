"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mobileNavItems } from "@/components/layout/nav-items"
import { useMobileNav } from "@/components/layout/mobile-nav-context"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { isMobileMenuOpen } = useMobileNav()

  if (isMobileMenuOpen) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur transition-transform duration-300 ease-out md:hidden"
      aria-label="Primary"
    >
      <div className="grid auto-cols-fr grid-flow-col gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
        {mobileNavItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {Icon ? <Icon className="h-5 w-5" /> : null}
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

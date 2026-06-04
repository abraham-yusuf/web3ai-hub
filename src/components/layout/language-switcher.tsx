"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOCALE_LABELS, LOCALE_FLAGS, type Locale, stripLocaleFromPath, addLocaleToPath } from "@/lib/i18n"
import { Globe } from "lucide-react"

interface LanguageSwitcherProps {
  className?: string
  currentLocale?: Locale
}

export function LanguageSwitcher({ className, currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  // Get the locale from the path, default to 'id' if not found
  const locale: Locale = currentLocale ?? "id"

  const handleLocaleChange = React.useCallback(
    (newLocale: Locale) => {
      setIsOpen(false)

      // Strip any existing locale from the path and add the new one
      const pathWithoutLocale = stripLocaleFromPath(pathname)
      const newPath = addLocaleToPath(pathWithoutLocale === "" ? "/" : pathWithoutLocale, newLocale)

      // Set cookie and navigate
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`
      router.push(newPath)
      router.refresh()
    },
    [pathname, router]
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn("gap-1.5 text-sm", className)}
        aria-label="Switch language"
      >
        <Button variant="ghost" size="sm">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{LOCALE_FLAGS[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              loc === locale && "bg-accent font-medium"
            )}
          >
            <span>{LOCALE_FLAGS[loc]}</span>
            <span>{LOCALE_LABELS[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Simple language switcher button group alternative (no dropdown).
 * Use this when you prefer a compact button group over a dropdown.
 */
export function LanguageSwitcherButtons({ className, currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()

  const locale: Locale = currentLocale ?? "id"

  const handleLocaleChange = React.useCallback(
    (newLocale: Locale) => {
      const pathWithoutLocale = stripLocaleFromPath(pathname)
      const newPath = addLocaleToPath(pathWithoutLocale === "" ? "/" : pathWithoutLocale, newLocale)

      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`
      router.push(newPath)
      router.refresh()
    },
    [pathname, router]
  )

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
        <Button
          key={loc}
          variant="ghost"
          size="sm"
          onClick={() => handleLocaleChange(loc)}
          className={cn(
            "h-8 px-2 text-xs gap-1",
            loc === locale && "bg-accent font-medium"
          )}
          aria-label={`Switch to ${LOCALE_LABELS[loc]}`}
        >
          <span>{LOCALE_FLAGS[loc]}</span>
          <span className="sr-only sm:not-sr-only">{loc.toUpperCase()}</span>
        </Button>
      ))}
    </div>
  )
}
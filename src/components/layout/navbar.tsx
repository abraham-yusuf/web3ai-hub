"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AI3Logo } from "@/components/branding/ai3-logo"
import { navItems } from "@/components/layout/nav-items"
import { useMobileNav } from "@/components/layout/mobile-nav-context"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Moon, Sun, Menu, X, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { getLocaleFromPath } from "@/lib/i18n"
import dynamic from "next/dynamic"

const NotificationBell = dynamic(
  () => import("@/components/airdrop/notification-bell").then((m) => ({ default: m.NotificationBell })),
  { ssr: false },
)

// Demo user ID - in production, this would come from auth session
const DEMO_USER_ID = "demo-user-123"

export function Navbar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileNav()

  React.useEffect(() => {
    const { body, documentElement } = document
    const previousBodyOverflow = body.style.overflow
    const previousHtmlOverflow = documentElement.style.overflow

    if (isMobileMenuOpen) {
      body.style.overflow = "hidden"
      documentElement.style.overflow = "hidden"
    }

    return () => {
      body.style.overflow = previousBodyOverflow
      documentElement.style.overflow = previousHtmlOverflow
    }
  }, [isMobileMenuOpen])

  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname, setIsMobileMenuOpen])

  React.useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobileMenuOpen, setIsMobileMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <AI3Logo />
            </Link>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          pathname === item.href && "text-primary",
                        )}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <form action="/search" className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Search..." className="h-9 w-48 pl-8" />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <NotificationBell userId={DEMO_USER_ID} />

            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button
              variant="ghost"
              size="icon-lg"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[9999] h-dvh min-h-screen transform-gpu overflow-hidden bg-white/95 transition-transform duration-300 ease-out dark:bg-background/95 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
          !isMobileMenuOpen && "pointer-events-none",
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="relative flex h-full flex-col overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-6"
        >
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Menu</span>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X />
            </Button>
          </div>
          <div className="relative z-10 flex-1 overflow-y-auto pb-6 pt-6">
            <form action="/search" className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Search..." className="h-11 pl-10" />
            </form>
            <nav className="mt-8 flex flex-col gap-2 sm:gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-muted/80",
                    pathname === item.href ? "text-primary" : "text-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.title}</span>
                  <span className="text-muted-foreground">-&gt;</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

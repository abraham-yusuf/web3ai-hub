"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bot, FileText, Gift, Home, Settings, UserCircle, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

type AdminShellProps = {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
  signOutAction: () => Promise<void>
}

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/ai-writer", label: "AI Writer", icon: Bot },
  { href: "/admin/airdrops", label: "Airdrops", icon: Gift },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Profile", icon: UserCircle },
]

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminShell({ children, user, signOutAction }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-72 shrink-0 border-r bg-background lg:flex lg:flex-col">
        <div className="border-b p-6">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            Web3AI Admin
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">Content operations center</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const active = isActivePath(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                  active ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Home className="h-4 w-4" />
            View site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin Panel</p>
              <p className="text-lg font-semibold">Kelola Web3AI Hub</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <nav className="flex gap-2 overflow-x-auto lg:hidden">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium",
                      isActivePath(pathname, item.href) ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-3 rounded-full border bg-muted/40 px-3 py-1.5">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium leading-none">{user.name || user.email || "Admin"}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{user.role || "ADMIN"}</p>
                </div>
                <Link href="/admin/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle className="h-5 w-5" />
                </Link>
              </div>
              <form action={signOutAction}>
                <button type="submit" className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium hover:bg-muted">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

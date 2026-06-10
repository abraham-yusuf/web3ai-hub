"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BarChart4, Bot, FileText, FlaskConical, Gift, GraduationCap, HelpCircle, Home, Languages, Search, Settings, Sparkles, TrendingUp, UserCircle, Wrench } from "lucide-react"
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
  { href: "/admin/analytics", label: "Analytics", icon: BarChart4 },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/learn", label: "Learn", icon: GraduationCap },
  { href: "/admin/learn/ai-tools", label: "AI Learn Tools", icon: Sparkles },
  { href: "/admin/learn/ai-research", label: "AI Research Tools", icon: FlaskConical },
  { href: "/admin/ai-writer", label: "AI Writer", icon: Bot },
  { href: "/admin/content/localization", label: "Content Localization", icon: Languages },
  { href: "/admin/seo", label: "SEO Dashboard", icon: TrendingUp },
  { href: "/admin/seo/topics", label: "Topic Clusters", icon: Search },
  { href: "/admin/seo/keywords", label: "Keyword Suggest", icon: Search },
  { href: "/admin/airdrops", label: "Airdrops", icon: Gift },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
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
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            Web3AI <span className="text-primary">Admin</span>
          </Link>
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
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-lg font-bold lg:hidden">
                W3AI <span className="text-primary">Admin</span>
              </Link>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-muted-foreground">Dashboard Hub</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-full border bg-muted/40 px-3 py-1">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium leading-none">{user.name || user.email || "Admin"}</p>
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">{user.role || "ADMIN"}</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle className="h-5 w-5" />
                </div>
              </div>
              <form action={signOutAction}>
                <button type="submit" className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium hover:bg-muted">
                  Logout
                </button>
              </form>
            </div>
          </div>

          {/* Mobile Secondary Nav */}
          <nav className="flex gap-1 overflow-x-auto border-t bg-background/50 px-2 py-2 lg:hidden">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  isActivePath(pathname, item.href) 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

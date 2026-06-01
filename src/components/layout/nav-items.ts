import type { LucideIcon } from "lucide-react"
import { BookOpen, Gift, Home, PenLine, Search, Sparkles, FlaskConical } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon?: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "Blog", href: "/blog", icon: PenLine },
  { title: "Learn", href: "/learn", icon: BookOpen },
  { title: "Research", href: "/research", icon: FlaskConical },
  { title: "Airdrops", href: "/airdrop", icon: Gift },
  { title: "AI Tools", href: "/ai-tools", icon: Sparkles },
  { title: "Search", href: "/search", icon: Search },
]

export const mobileNavItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Blog", href: "/blog", icon: PenLine },
  { title: "Learn", href: "/learn", icon: BookOpen },
  { title: "Research", href: "/research", icon: FlaskConical },
  { title: "Airdrops", href: "/airdrop", icon: Gift },
  { title: "AI Tools", href: "/ai-tools", icon: Sparkles },
]

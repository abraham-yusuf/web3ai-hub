import type { LucideIcon } from "lucide-react"
import { BookOpen, Gift, Home, PenLine, Search, Sparkles, FlaskConical, Tag, Wrench } from "lucide-react"

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
  { title: "Web3 Tools", href: "/web3-tools", icon: Wrench },
  { title: "Topics", href: "/topics", icon: Tag },
  { title: "Search", href: "/search", icon: Search },
]

export const mobileNavItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Blog", href: "/blog", icon: PenLine },
  { title: "Learn", href: "/learn", icon: BookOpen },
  { title: "Research", href: "/research", icon: FlaskConical },
  { title: "Topics", href: "/topics", icon: Tag },
  { title: "Airdrops", href: "/airdrop", icon: Gift },
  { title: "AI Tools", href: "/ai-tools", icon: Sparkles },
  { title: "Web3 Tools", href: "/web3-tools", icon: Wrench },
]

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, BookMarked } from "lucide-react"
import type { LearnNavTrack } from "@/lib/learn"
import { cn } from "@/lib/utils"

type LearnSidebarProps = {
  tracks: LearnNavTrack[]
  onNavigate?: () => void
}

export function LearnSidebar({ tracks, onNavigate }: LearnSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-full shrink-0 space-y-4 md:w-72 md:border-r md:pr-6">
      {/* AI Tools */}
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-3">AI Tools</p>
        <Link
          href="/learn/generator"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-base transition-colors hover:bg-muted hover:text-primary md:px-2 md:py-1.5 md:text-sm",
            pathname === "/learn/generator" ? "bg-muted text-primary" : "",
          )}
          onClick={onNavigate}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          AI Roadmap Generator
        </Link>
        <Link
          href="/learn/roadmaps"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-base transition-colors hover:bg-muted hover:text-primary md:px-2 md:py-1.5 md:text-sm",
            pathname === "/learn/roadmaps" || pathname.startsWith("/learn/roadmap/") ? "bg-muted text-primary" : "",
          )}
          onClick={onNavigate}
        >
          <BookMarked className="h-4 w-4 shrink-0" />
          My Roadmaps
        </Link>
      </div>

      <div className="border-t" />

      {/* Track Content */}
      {tracks.map((track) => (
        <details key={track.slug} open className="rounded-lg border p-3">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {track.title}
          </summary>
          <div className="mt-3 space-y-3">
            {track.sections.map((section) => (
              <div key={`${track.slug}-${section.title}`} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{section.title}</p>
                {section.pages.map((page) => {
                  const href = `/learn/${page.slug}`
                  const active = pathname === href

                  return (
                    <Link
                      key={page.slug}
                      href={href}
                      className={`block rounded-md px-3 py-2.5 text-base transition-colors hover:bg-muted hover:text-primary md:px-2 md:py-1.5 md:text-sm ${active ? "bg-muted text-primary" : ""}`}
                      onClick={onNavigate}
                    >
                      {page.title}
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        </details>
      ))}
    </aside>
  )
}

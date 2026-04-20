"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LearnNavTrack } from "@/lib/learn"

type LearnSidebarProps = {
  tracks: LearnNavTrack[]
}

export function LearnSidebar({ tracks }: LearnSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-full shrink-0 space-y-4 border-r pr-6 md:w-72">
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
                      className={`block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted hover:text-primary ${active ? "bg-muted text-primary" : ""}`}
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

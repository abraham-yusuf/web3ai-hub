"use client"

import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import type { LearnNavTrack } from "@/lib/learn"
import { cn } from "@/lib/utils"
import { LearnSidebar } from "@/components/learn/learn-sidebar"
import { Button } from "@/components/ui/button"

type LearnSidebarDrawerProps = {
  tracks: LearnNavTrack[]
}

export function LearnSidebarDrawer({ tracks }: LearnSidebarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full justify-between"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="learn-mobile-sidebar"
      >
        Daftar Materi
        <Menu className="h-5 w-5" />
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          isOpen ? "visible" : "invisible",
          !isOpen && "pointer-events-none",
        )}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          aria-label="Close sidebar"
          onClick={() => setIsOpen(false)}
        />
        <div
          id="learn-mobile-sidebar"
          role="dialog"
          aria-modal="true"
          className={cn(
            "absolute left-0 top-0 h-full w-[min(85vw,22rem)] bg-background p-4 shadow-xl transition-transform",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Navigasi Belajar</span>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Close sidebar"
              onClick={() => setIsOpen(false)}
            >
              <X />
            </Button>
          </div>
          <div className="mt-4 h-[calc(100%-3rem)] overflow-y-auto pb-10">
            <LearnSidebar tracks={tracks} onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  )
}

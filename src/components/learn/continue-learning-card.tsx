"use client"

import Link from "next/link"
import { useMemo } from "react"

type LearnPageRef = {
  slug: string
  title: string
}

type ContinueLearningCardProps = {
  pages: LearnPageRef[]
}

export function ContinueLearningCard({ pages }: ContinueLearningCardProps) {
  const target = useMemo(() => {
    if (!pages.length) return null

    if (typeof window === "undefined") {
      return pages[0]
    }

    const firstIncomplete = pages.find((page) => {
      const key = `learn_progress_${page.slug}`
      return window.localStorage.getItem(key) !== "1"
    })

    return firstIncomplete ?? pages[0]
  }, [pages])

  if (!target) return null

  return (
    <section className="rounded-2xl border bg-muted/30 p-6">
      <p className="text-sm font-medium text-muted-foreground">Continue learning</p>
      <h2 className="mt-2 text-2xl font-bold">{target.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Lanjutkan materi terakhir untuk menjaga progres belajar.</p>
      <Link href={`/learn/${target.slug}`} className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
        Lanjut Belajar
      </Link>
    </section>
  )
}

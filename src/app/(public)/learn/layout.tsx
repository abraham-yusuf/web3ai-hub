import { getLearnStructure } from "@/lib/mdx"
import Link from "next/link"

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structure = getLearnStructure()

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-8 md:flex-row">
      <aside className="w-full shrink-0 space-y-8 border-r pr-6 md:w-64">
        {structure.map((track) => (
          <div key={track.slug} className="space-y-4">
            <h3 className="px-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">{track.title}</h3>
            <div className="space-y-1">
              {track.pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted hover:text-primary"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </aside>

      <main className="max-w-3xl flex-1">{children}</main>
    </div>
  )
}

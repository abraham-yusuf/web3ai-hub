import { getLearnStructure } from "@/lib/mdx"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structure = getLearnStructure()

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-10rem)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-r pr-6 space-y-8">
        {structure.map((track: any) => (
          <div key={track.slug} className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground px-2">
              {track.title}
            </h3>
            <div className="space-y-1">
              {track.pages.map((page: any) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="block px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-muted hover:text-primary"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 max-w-3xl">
        {children}
      </main>
    </div>
  )
}

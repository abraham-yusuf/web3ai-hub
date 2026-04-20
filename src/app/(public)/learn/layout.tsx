import { LearnSidebar } from "@/components/learn/learn-sidebar"
import { getLearnNavigation } from "@/lib/learn"

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structure = await getLearnNavigation()

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-8 md:flex-row">
      <LearnSidebar tracks={structure} />
      <main className="max-w-3xl flex-1">{children}</main>
    </div>
  )
}

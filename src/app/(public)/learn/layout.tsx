import { LearnSidebar } from "@/components/learn/learn-sidebar"
import { LearnSidebarDrawer } from "@/components/learn/learn-sidebar-drawer"
import { getLearnNavigation } from "@/lib/learn"

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structure = await getLearnNavigation()

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-6 md:flex-row md:gap-8">
      <div className="md:hidden">
        <LearnSidebarDrawer tracks={structure} />
      </div>
      <div className="hidden md:block">
        <LearnSidebar tracks={structure} />
      </div>
      <main className="max-w-3xl flex-1">{children}</main>
    </div>
  )
}

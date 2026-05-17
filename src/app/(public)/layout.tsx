import { Footer } from "@/components/layout/footer"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { Navbar } from "@/components/layout/navbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="container flex-1 px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  )
}

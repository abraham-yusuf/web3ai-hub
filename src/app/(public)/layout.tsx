import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="container flex-1 px-4 py-8 md:px-6">
        {children}
      </main>
      <Footer />
    </>
  )
}

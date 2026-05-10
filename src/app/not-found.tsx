import Link from "next/link"
import { ArrowRight, BookOpen, Home, Search, Sparkles } from "lucide-react"

const recoveryLinks = [
  { href: "/learn", label: "Learn Track", description: "Lanjutkan materi Web3 & AI", icon: BookOpen },
  { href: "/airdrop", label: "Airdrop Hub", description: "Cari peluang airdrop aktif", icon: Sparkles },
  { href: "/search", label: "Global Search", description: "Temukan blog, lesson, tools", icon: Search },
]

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center px-4 py-12">
      <div className="grid w-full overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-primary/10 p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">404</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Halaman tidak ditemukan</h1>
            <p className="mt-4 text-muted-foreground">
              URL yang kamu akses tidak tersedia, sudah dipindahkan, atau belum dipublikasikan.
            </p>
          </div>
          <Link href="/" className="mt-8 inline-flex h-10 w-fit items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Home
          </Link>
        </div>

        <div className="space-y-4 p-8">
          <div>
            <h2 className="text-xl font-semibold">Coba jalur berikut</h2>
            <p className="text-sm text-muted-foreground">Pilih salah satu pintasan untuk kembali menjelajah konten Web3AI Hub.</p>
          </div>
          <div className="grid gap-3">
            {recoveryLinks.map((item) => {
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href} className="group flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-primary hover:bg-primary/5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

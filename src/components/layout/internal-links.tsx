import Link from "next/link"

const modules = [
  {
    title: "Belajar Terstruktur",
    description: "Ikuti kurikulum Web3 & AI step-by-step di modul Learn.",
    href: "/learn",
  },
  {
    title: "Airdrop Hub",
    description: "Cari peluang airdrop aktif beserta checklist task.",
    href: "/airdrop",
  },
  {
    title: "AI Tools Directory",
    description: "Bandingkan tools AI untuk kebutuhan konten dan produktivitas.",
    href: "/ai-tools",
  },
]

type InternalLinksBlockProps = {
  title?: string
}

export function InternalLinksBlock({ title = "Eksplorasi Modul Lain" }: InternalLinksBlockProps) {
  return (
    <section className="space-y-4 rounded-xl border p-5">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="rounded-lg border p-4 transition-colors hover:border-primary">
            <p className="font-semibold">{module.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

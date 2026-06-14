import Link from "next/link"
import { Check, X, Zap } from "lucide-react"

export const metadata = {
  title: "Pricing — AI3 Web3 Hub",
  description: "Pilih paket yang sesuai kebutuhan Anda. Gratis, Pro, atau Enterprise.",
}

const tiers = [
  {
    name: "Free",
    price: "Rp 0",
    period: "/bulan",
    description: "Cocok untuk pemula yang ingin menjelajahi ekosistem Web3 & AI.",
    cta: "Mulai Gratis",
    ctaHref: "/auth/register",
    ctaVariant: "outline" as const,
    popular: false,
    features: [
      { label: "Baca semua artikel blog", included: true },
      { label: "Akses dasar Learn (modul gratis)", included: true },
      { label: "Airdrop tracking (top 20)", included: true },
      { label: "AI Writer (3 generasi/hari)", included: true },
      { label: "AI Tools Directory", included: true },
      { label: "Research Assistant (3 query/hari)", included: true },
      { label: "Premium learn tracks", included: false },
      { label: "AI Writer unlimited", included: false },
      { label: "Advanced AI models (GPT-4o, Claude 3.5)", included: false },
      { label: "Tool comparison lanjutan (>3 tools)", included: false },
      { label: "API access", included: false },
      { label: "Team management", included: false },
      { label: "Custom AI models", included: false },
    ],
  },
  {
    name: "Pro",
    price: "Rp 49.000",
    period: "/bulan",
    description: "Untuk researcher, trader, dan kreator konten Web3 yang serius.",
    cta: "Upgrade ke Pro",
    ctaHref: "/pricing#upgrade",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      { label: "Baca semua artikel blog", included: true },
      { label: "Akses dasar Learn (modul gratis)", included: true },
      { label: "Airdrop tracking (semua airdrop)", included: true },
      { label: "AI Writer (50 generasi/hari)", included: true },
      { label: "AI Tools Directory", included: true },
      { label: "Research Assistant (50 query/hari)", included: true },
      { label: "Premium learn tracks", included: true },
      { label: "AI Writer unlimited (coming soon)", included: true },
      { label: "Advanced AI models (GPT-4o, Claude 3.5)", included: true },
      { label: "Tool comparison lanjutan (hingga 20 tools)", included: true },
      { label: "API access", included: false },
      { label: "Team management", included: false },
      { label: "Custom AI models", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "Rp 199.000",
    period: "/bulan",
    description: "Untuk tim, perusahaan, dan institusi pendidikan.",
    cta: "Hubungi Kami",
    ctaHref: "mailto:admin@ai3.web.id?subject=Enterprise%20Plan%20Inquiry",
    ctaVariant: "outline" as const,
    popular: false,
    features: [
      { label: "Baca semua artikel blog", included: true },
      { label: "Akses dasar Learn (modul gratis)", included: true },
      { label: "Airdrop tracking (semua airdrop)", included: true },
      { label: "AI Writer (unlimited)", included: true },
      { label: "AI Tools Directory", included: true },
      { label: "Research Assistant (unlimited)", included: true },
      { label: "Premium learn tracks", included: true },
      { label: "AI Writer unlimited", included: true },
      { label: "Advanced AI models (GPT-4o, Claude 3.5)", included: true },
      { label: "Tool comparison lanjutan (hingga 20 tools)", included: true },
      { label: "API access", included: true },
      { label: "Team management (hingga 50 anggota)", included: true },
      { label: "Custom AI models", included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
          <Zap className="h-3.5 w-3.5" />
          <span>Harga transparan, tanpa biaya tersembunyi</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          Pilih Paket yang Tepat
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Mulai gratis selamanya. Upgrade kapan saja untuk membuka fitur premium
          dan mempercepat perjalanan Web3 AI Anda.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={[
              "relative flex flex-col rounded-2xl border p-8",
              tier.popular
                ? "border-primary shadow-lg shadow-primary/10 bg-primary/5 dark:bg-primary/10"
                : "border-border bg-card",
            ].join(" ")}
          >
            {tier.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow">
                  ⭐ Most Popular
                </span>
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-bold">{tier.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tabular-nums">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
            </div>
            <Link
              href={tier.ctaHref}
              className={[
                "mb-8 inline-flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
                tier.ctaVariant === "default"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border bg-background hover:bg-muted",
              ].join(" ")}
            >
              {tier.cta}
            </Link>
            <ul className="space-y-3 flex-1">
              {tier.features.map((feat) => (
                <li key={feat.label} className="flex items-start gap-3 text-sm">
                  {feat.included ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                  )}
                  <span className={feat.included ? "" : "text-muted-foreground/50"}>
                    {feat.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="mt-24">
        <h2 className="text-2xl font-bold text-center mb-8">Perbandingan Fitur Lengkap</h2>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left font-semibold">Fitur</th>
                <th className="px-6 py-3 text-center font-semibold">Free</th>
                <th className="px-6 py-3 text-center font-semibold text-primary">Pro</th>
                <th className="px-6 py-3 text-center font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Blog & Artikel", "Unlimited", "Unlimited", "Unlimited"],
                ["Learn Modules", "Gratis saja", "Semua modul", "Semua modul"],
                ["AI Writer", "3/hari", "50/hari", "Unlimited"],
                ["Research Assistant", "3/hari", "50/hari", "Unlimited"],
                ["Airdrop Tracking", "Top 20", "Semua", "Semua"],
                ["Advanced AI Models", "❌", "✅", "✅"],
                ["Premium Tracks", "❌", "✅", "✅"],
                ["API Access", "❌", "❌", "✅"],
                ["Team Management", "❌", "❌", "✅ (50 seats)"],
                ["Custom AI Models", "❌", "❌", "✅"],
                ["Priority Support", "Community", "Email", "Dedicated"],
              ].map(([feature, free, pro, enterprise]) => (
                <tr key={feature} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3 font-medium">{feature}</td>
                  <td className="px-6 py-3 text-center text-muted-foreground">{free}</td>
                  <td className="px-6 py-3 text-center font-medium text-primary">{pro}</td>
                  <td className="px-6 py-3 text-center text-muted-foreground">{enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-xl font-bold mb-2">Ada pertanyaan?</h2>
        <p className="text-muted-foreground text-sm">
          Hubungi kami di{" "}
          <a href="mailto:admin@ai3.web.id" className="text-primary underline underline-offset-2">
            admin@ai3.web.id
          </a>{" "}
          atau upgrade secara manual sebelum integrasi pembayaran selesai.
        </p>
      </div>
    </div>
  )
}

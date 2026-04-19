import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Cpu, Globe, Rocket } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Belajar <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Web3 & AI</span> dalam Satu Platform
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[800px]">
          Web3AI Hub adalah platform konten all-in-one untuk komunitas Web3 & AI Indonesia. 
          Temukan tutorial mendalam, info airdrop terbaru, dan direktori tools AI tercanggih.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/learn" className={buttonVariants({ size: "lg", className: "h-12 px-8" })}>
            Mulai Belajar <Rocket className="ml-2 h-5 w-5" />
          </Link>
          <Link href="/airdrop" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 px-8" })}>
            Cek Airdrop
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group">
          <CardHeader>
            <BookOpen className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Blog Edukasi</CardTitle>
            <CardDescription>
              Artikel dan berita terbaru seputar perkembangan teknologi Web3 dan AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blog" className="text-sm font-medium flex items-center text-primary hover:underline">
              Baca Blog <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <CardHeader>
            <Globe className="h-10 w-10 text-secondary mb-2" />
            <CardTitle>Learn Track</CardTitle>
            <CardDescription>
              Kurikulum terstruktur untuk menguasai blockchain, solidity, dan prompt engineering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/learn" className="text-sm font-medium flex items-center text-primary hover:underline">
              Eksplor Materi <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <CardHeader>
            <Rocket className="h-10 w-10 text-accent mb-2" />
            <CardTitle>Airdrop Hub</CardTitle>
            <CardDescription>
              Panduan step-by-step untuk berburu airdrop potensial dan tugas testnet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/airdrop" className="text-sm font-medium flex items-center text-primary hover:underline">
              Cari Airdrop <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <CardHeader>
            <Cpu className="h-10 w-10 text-success mb-2" />
            <CardTitle>AI Directory</CardTitle>
            <CardDescription>
              Katalog tools AI terbaik untuk produktivitas, coding, dan konten kreator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ai-tools" className="text-sm font-medium flex items-center text-primary hover:underline">
              Lihat Tools <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="rounded-3xl bg-muted p-8 md:p-12 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl font-bold">Siap Menjelajahi Masa Depan?</h2>
        <p className="text-muted-foreground max-w-2xl">
          Bergabunglah dengan ribuan orang lainnya yang belajar dan berkembang di ekosistem Web3 dan AI.
        </p>
        <Link href="/learn" className={buttonVariants({ size: "lg", variant: "default" })}>
          Daftar Sekarang
        </Link>
      </section>
    </div>
  )
}

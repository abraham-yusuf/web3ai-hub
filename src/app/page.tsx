import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Cpu, Globe, Rocket } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { ContinueLearningCard } from "@/components/learn/continue-learning-card"
import { getLearnNavigation } from "@/lib/learn"

export default async function HomePage() {
  const learnNavigation = await getLearnNavigation()
  const learnPages = learnNavigation.flatMap((track) =>
    track.sections.flatMap((section) =>
      section.pages.map((page) => ({ slug: page.slug, title: page.title })),
    ),
  )

  return (
    <div className="flex flex-col gap-16 py-8 md:py-12">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Belajar <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Web3 & AI</span> dalam Satu Platform
        </h1>
        <p className="max-w-[800px] text-lg text-muted-foreground md:text-xl">
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

      <ContinueLearningCard pages={learnPages} />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden">
          <CardHeader>
            <BookOpen className="mb-2 h-10 w-10 text-primary" />
            <CardTitle>Blog Edukasi</CardTitle>
            <CardDescription>
              Artikel dan berita terbaru seputar perkembangan teknologi Web3 dan AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blog" className="flex items-center text-sm font-medium text-primary hover:underline">
              Baca Blog <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden">
          <CardHeader>
            <Globe className="mb-2 h-10 w-10 text-secondary" />
            <CardTitle>Learn Track</CardTitle>
            <CardDescription>
              Kurikulum terstruktur untuk menguasai blockchain, solidity, dan prompt engineering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/learn" className="flex items-center text-sm font-medium text-primary hover:underline">
              Eksplor Materi <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden">
          <CardHeader>
            <Rocket className="mb-2 h-10 w-10 text-accent" />
            <CardTitle>Airdrop Hub</CardTitle>
            <CardDescription>
              Panduan step-by-step untuk berburu airdrop potensial dan tugas testnet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/airdrop" className="flex items-center text-sm font-medium text-primary hover:underline">
              Cari Airdrop <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden">
          <CardHeader>
            <Cpu className="mb-2 h-10 w-10 text-success" />
            <CardTitle>AI Directory</CardTitle>
            <CardDescription>
              Katalog tools AI terbaik untuk produktivitas, coding, dan konten kreator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ai-tools" className="flex items-center text-sm font-medium text-primary hover:underline">
              Lihat Tools <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col items-center gap-6 rounded-3xl bg-muted p-8 text-center md:p-12">
        <h2 className="text-3xl font-bold">Siap Menjelajahi Masa Depan?</h2>
        <p className="max-w-2xl text-muted-foreground">
          Bergabunglah dengan ribuan orang lainnya yang belajar dan berkembang di ekosistem Web3 dan AI.
        </p>
        <Link href="/learn" className={buttonVariants({ size: "lg", variant: "default" })}>
          Daftar Sekarang
        </Link>
      </section>
    </div>
  )
}

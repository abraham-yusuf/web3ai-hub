import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Star } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AiToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; pricing?: string }>
}) {
  const { q, category, pricing } = await searchParams

  const tools = await prisma.aITool.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: 'insensitive' } } : {},
        category ? { category: { contains: category, mode: 'insensitive' } } : {},
        pricing ? { pricing: pricing } : {},
      ]
    },
    orderBy: { rating: 'desc' }
  })

  const categories = [
    "Writing & Content",
    "Image Generation",
    "Video Generation",
    "Coding & Development",
    "Audio & Music",
    "Web3 & Crypto"
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">AI Tools Directory</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Koleksi tools AI terbaik untuk membantu produktivitas dan kreativitas Anda.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari tools AI..." 
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge key={cat} variant="outline" className="cursor-pointer hover:bg-primary/10">
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.length > 0 ? (
          tools.map((tool) => (
            <Link key={tool.id} href={`/ai-tools/${tool.slug}`}>
              <Card className="h-full hover:border-primary transition-colors flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{tool.category}</Badge>
                    <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      {tool.rating}
                    </div>
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tool.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{tool.pricing}</Badge>
                    <span className="text-xs font-medium text-primary hover:underline">Detail →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Belum ada tools AI yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  )
}

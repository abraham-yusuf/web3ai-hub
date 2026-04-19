import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function AirdropPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; network?: string }>
}) {
  const { q, status, network } = await searchParams

  // Fetch airdrops with basic filtering
  const airdrops = await prisma.airdrop.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: 'insensitive' } } : {},
        status ? { status: status as any } : {},
        network ? { network: { contains: network, mode: 'insensitive' } } : {},
      ]
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Airdrop Hub</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Temukan potensi airdrop terbaru dan panduan cara mendapatkannya.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama project..." 
            className="pl-10"
            // Note: Real filtering would use client-side navigation or server actions
          />
        </div>
        <div className="flex gap-2">
          {/* Simple filter badges (placeholders for real filter logic) */}
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Semua</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Active</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Ethereum</Badge>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {airdrops.length > 0 ? (
          airdrops.map((airdrop) => (
            <Link key={airdrop.id} href={`/airdrop/${airdrop.slug}`}>
              <Card className="h-full hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={airdrop.status === 'ACTIVE' ? 'success' : 'secondary' as any}>
                      {airdrop.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{airdrop.network}</span>
                  </div>
                  <CardTitle>{airdrop.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    Est. Reward: {airdrop.estimatedReward || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className={cn(
                      "font-medium",
                      airdrop.difficulty === 'EASY' ? 'text-emerald-500' : 
                      airdrop.difficulty === 'MEDIUM' ? 'text-amber-500' : 'text-red-500'
                    )}>
                      {airdrop.difficulty}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Belum ada data airdrop yang sesuai.</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AirdropStatus } from "@prisma/client"
import { Search } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

interface AirdropSearchParams {
  q?: string
  status?: AirdropStatus
  network?: string
}

export default async function AirdropPage({
  searchParams,
}: {
  searchParams: Promise<AirdropSearchParams>
}) {
  const { q, status, network } = await searchParams

  const airdrops = await prisma.airdrop.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: "insensitive" } } : {},
        status ? { status } : {},
        network ? { network: { contains: network, mode: "insensitive" } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Airdrop Hub</h1>
          <p className="mt-2 text-lg text-muted-foreground">Temukan potensi airdrop terbaru dan panduan cara mendapatkannya.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari nama project..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
            Semua
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
            Active
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
            Ethereum
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {airdrops.length > 0 ? (
          airdrops.map((airdrop) => {
            const statusVariant = airdrop.status === "ACTIVE" ? "default" : "secondary"

            return (
              <Link key={airdrop.id} href={`/airdrop/${airdrop.slug}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader>
                    <div className="mb-2 flex items-start justify-between">
                      <Badge variant={statusVariant}>{airdrop.status}</Badge>
                      <span className="text-xs text-muted-foreground">{airdrop.network}</span>
                    </div>
                    <CardTitle>{airdrop.name}</CardTitle>
                    <CardDescription className="font-medium text-primary">Est. Reward: {airdrop.estimatedReward ?? "Unknown"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span
                        className={cn(
                          "font-medium",
                          airdrop.difficulty === "EASY"
                            ? "text-emerald-500"
                            : airdrop.difficulty === "MEDIUM"
                              ? "text-amber-500"
                              : "text-red-500",
                        )}
                      >
                        {airdrop.difficulty}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full rounded-lg border bg-muted/20 py-20 text-center">
            <p className="text-muted-foreground">Belum ada data airdrop yang sesuai.</p>
          </div>
        )}
      </div>
    </div>
  )
}

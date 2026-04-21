import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AirdropStatus, Difficulty } from "@prisma/client"
import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Airdrop Hub",
  description: "Cari airdrop aktif dengan filter status, network, dan difficulty.",
  alternates: { canonical: "/airdrop" },
}

interface AirdropSearchParams {
  q?: string
  status?: AirdropStatus | "ALL"
  network?: string
  difficulty?: Difficulty | "ALL"
  sort?: "newest" | "reward"
}

export default async function AirdropPage({
  searchParams,
}: {
  searchParams: Promise<AirdropSearchParams>
}) {
  const { q, status = "ALL", network, difficulty = "ALL", sort = "newest" } = await searchParams

  const airdrops = await prisma.airdrop.findMany({
      where: {
        AND: [
          q ? { name: { contains: q, mode: "insensitive" } } : {},
          status !== "ALL" ? { status } : {},
          network ? { network: { contains: network, mode: "insensitive" } } : {},
          difficulty !== "ALL" ? { difficulty } : {},
        ],
      },
      orderBy: sort === "reward" ? { estimatedReward: "desc" } : { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Airdrop Hub</h1>
        <p className="mt-2 text-lg text-muted-foreground">Temukan peluang airdrop dengan state filter yang bisa dishare via URL.</p>
      </div>

      <form method="GET" className="grid gap-3 rounded-xl border p-4 md:grid-cols-5">
        <Input name="q" placeholder="Cari nama project..." defaultValue={q} className="md:col-span-2" />
        <Input name="network" placeholder="Network (contoh: Ethereum)" defaultValue={network} />
        <select name="status" defaultValue={status} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="UPCOMING">UPCOMING</option>
          <option value="ENDED">ENDED</option>
        </select>
        <div className="flex gap-2">
          <select name="difficulty" defaultValue={difficulty} className="flex-1 rounded-md border bg-background px-3 py-2 text-sm">
            <option value="ALL">Semua Difficulty</option>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
          <select name="sort" defaultValue={sort} className="flex-1 rounded-md border bg-background px-3 py-2 text-sm">
            <option value="newest">Newest</option>
            <option value="reward">Reward</option>
          </select>
        </div>
        <button type="submit" className="md:col-span-5 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Apply Filters</button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Result: {airdrops.length}</Badge>
        <Badge variant="outline">Status: {status}</Badge>
        <Badge variant="outline">Difficulty: {difficulty}</Badge>
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

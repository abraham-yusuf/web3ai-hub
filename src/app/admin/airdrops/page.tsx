import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { bulkUpdateAirdropStatusAction, deleteAirdropAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminAirdropsPage() {
  const airdrops = await prisma.airdrop.findMany({ orderBy: { updatedAt: "desc" } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Airdrop Manager</h1>
          <p className="text-muted-foreground">Kelola listing, status, dan konten panduan airdrop.</p>
        </div>
        <Link href="/admin/airdrops/new" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Tambah Airdrop</Link>
      </div>

      <form id="bulk-airdrop-status-form" action={bulkUpdateAirdropStatusAction} className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium">Bulk status update</p>
          <p className="text-xs text-muted-foreground">Centang beberapa project di tabel, pilih status baru, lalu update sekaligus.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select name="status" className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="ACTIVE">ACTIVE</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="ENDED">ENDED</option>
          </select>
          <Button type="submit" size="lg">Update Selected</Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-4 py-3 text-left">Pilih</th>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Network</th>
              <th className="px-4 py-3 text-left">Difficulty</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {airdrops.map((airdrop) => (
              <tr key={airdrop.id} className="border-t">
                <td className="px-4 py-3">
                  <input form="bulk-airdrop-status-form" type="checkbox" name="ids" value={airdrop.id} aria-label={`Pilih ${airdrop.name}`} className="h-4 w-4 rounded border-input" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{airdrop.name}</p>
                  <p className="text-xs text-muted-foreground">/{airdrop.slug}</p>
                </td>
                <td className="px-4 py-3"><Badge variant={airdrop.status === "ACTIVE" ? "default" : "secondary"}>{airdrop.status}</Badge></td>
                <td className="px-4 py-3">{airdrop.network}</td>
                <td className="px-4 py-3">{airdrop.difficulty}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/airdrops/${airdrop.id}/edit`} className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium">Edit</Link>
                    <form action={deleteAirdropAction}>
                      <input type="hidden" name="id" value={airdrop.id} />
                      <Button type="submit" variant="destructive" size="sm">Delete</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

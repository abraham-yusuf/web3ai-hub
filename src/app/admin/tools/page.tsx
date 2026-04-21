import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteToolAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminToolsPage() {
  const tools = await prisma.aITool.findMany({ orderBy: { updatedAt: "desc" } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Tools Manager</h1>
          <p className="text-muted-foreground">Kelola tools, badge featured, dan affiliate link.</p>
        </div>
        <Link href="/admin/tools/new" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Tambah Tool</Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Pricing</th><th className="px-4 py-3 text-left">Badges</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id} className="border-t">
                <td className="px-4 py-3"><p className="font-medium">{tool.name}</p><p className="text-xs text-muted-foreground">/{tool.slug}</p></td>
                <td className="px-4 py-3">{tool.category}</td>
                <td className="px-4 py-3">{tool.pricing}</td>
                <td className="px-4 py-3">{tool.featured ? <Badge>FEATURED</Badge> : <span className="text-xs text-muted-foreground">-</span>}</td>
                <td className="px-4 py-3"><div className="flex gap-2"><Link href={`/admin/tools/${tool.id}/edit`} className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium">Edit</Link><form action={deleteToolAction}><input type="hidden" name="id" value={tool.id} /><Button type="submit" size="sm" variant="destructive">Delete</Button></form></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

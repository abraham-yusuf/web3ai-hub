import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteToolAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminToolsPage() {
  const tools = await prisma.aITool.findMany({ orderBy: { updatedAt: "desc" } })

  const sponsoredCount = tools.filter((t) => t.sponsored).length
  const featuredCount = tools.filter((t) => t.featured).length
  const affiliateCount = tools.filter((t) => t.affiliateLink).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Tools Manager</h1>
          <p className="text-muted-foreground">
            {tools.length} tools · {sponsoredCount} sponsored · {featuredCount} featured · {affiliateCount} affiliate
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tools/sponsored" className="inline-flex h-9 items-center rounded-md border border-amber-500/50 bg-amber-500/10 px-4 text-sm font-medium text-amber-600 dark:text-amber-400">
            ⭐ Sponsored
          </Link>
          <Link href="/admin/tools/import" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
            Import
          </Link>
          <Link href="/admin/tools/new" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Tambah Tool
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Pricing</th>
              <th className="px-4 py-3 text-left">Badges</th>
              <th className="px-4 py-3 text-left">Affiliate</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => {
              const isExpiring = tool.sponsoredUntil && tool.sponsored &&
                tool.sponsoredUntil.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

              return (
                <tr key={tool.id} className="border-t">
                  <td className="px-4 py-3">
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">/{tool.slug}</p>
                  </td>
                  <td className="px-4 py-3">{tool.category}</td>
                  <td className="px-4 py-3">{tool.pricing}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {tool.featured && <Badge>FEATURED</Badge>}
                      {tool.sponsored && (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                          SPONSORED
                        </Badge>
                      )}
                      {isExpiring && (
                        <Badge variant="destructive" className="text-xs">
                          EXPIRING
                        </Badge>
                      )}
                      {!tool.featured && !tool.sponsored && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {tool.affiliateLink ? (
                      <span className="text-xs text-green-500">✓ Active</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/tools/${tool.id}/edit`}
                        className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <form action={deleteToolAction}>
                        <input type="hidden" name="id" value={tool.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

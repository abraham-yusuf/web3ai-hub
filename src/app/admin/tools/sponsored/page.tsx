import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  toggleSponsoredAction,
  updateSponsoredDetailsAction,
  expireSponsoredToolsAction,
} from "../actions"

export const dynamic = "force-dynamic"

export default async function SponsoredToolsPage() {
  // Auto-expire past-due sponsored tools
  await expireSponsoredToolsAction()

  const [sponsoredTools, availableTools, recentActivity] = await Promise.all([
    prisma.aITool.findMany({
      where: { sponsored: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        sponsored: true,
        sponsoredUntil: true,
        sponsoredPackage: true,
        sponsoredNote: true,
        affiliateLink: true,
        viewCount: true,
        rating: true,
        _count: { select: { clicks: true } },
      },
    }),
    prisma.aITool.findMany({
      where: { sponsored: false },
      orderBy: { viewCount: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        viewCount: true,
        rating: true,
        affiliateLink: true,
      },
    }),
    // Recent sponsored changes from audit log
    prisma.adminActivity.findMany({
      where: {
        action: { in: ["tool.sponsored", "tool.unsponsored", "tool.sponsored.update"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const now = new Date()

  // Package pricing reference
  const packages = [
    { id: "basic", label: "Basic", price: "$99/mo", features: "Badge + sort boost" },
    { id: "premium", label: "Premium", price: "$249/mo", features: "Badge + top placement + highlight" },
    { id: "enterprise", label: "Enterprise", price: "$499/mo", features: "All premium + dedicated section + newsletter" },
  ]

  // Revenue estimate
  const monthlyRevenue = sponsoredTools.reduce((acc, t) => {
    const pkg = packages.find((p) => p.id === t.sponsoredPackage)
    if (!pkg) return acc
    return acc + parseInt(pkg.price.replace(/[^0-9]/g, ""))
  }, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/tools" className="text-muted-foreground hover:text-foreground text-sm">
              ← Tools
            </Link>
            <h1 className="text-3xl font-bold">Sponsored Tools</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage promoted listings, packages, and scheduling
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active Sponsored</p>
          <p className="text-3xl font-bold">{sponsoredTools.length}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          <p className="text-3xl font-bold">${monthlyRevenue}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Expiring Soon</p>
          <p className="text-3xl font-bold text-amber-500">
            {sponsoredTools.filter((t) =>
              t.sponsoredUntil && t.sponsoredUntil.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
            ).length}
          </p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total Sponsored Clicks</p>
          <p className="text-3xl font-bold">
            {sponsoredTools.reduce((acc, t) => acc + t._count.clicks, 0)}
          </p>
        </div>
      </div>

      {/* Package Reference */}
      <div className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-3">📦 Packages</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{pkg.label}</span>
                <Badge variant="outline">{pkg.price}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{pkg.features}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sponsored Tools */}
      <div className="rounded-xl border">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">⭐ Active Sponsored Tools</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Tool</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Note</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-right">Clicks</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsoredTools.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Belum ada sponsored tools. Pilih tool dari daftar di bawah untuk memulai.
                  </td>
                </tr>
              )}
              {sponsoredTools.map((tool) => {
                const daysLeft = tool.sponsoredUntil
                  ? Math.ceil((tool.sponsoredUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  : null
                const isExpiring = daysLeft !== null && daysLeft <= 7

                return (
                  <tr key={tool.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      {tool.sponsoredPackage ? (
                        <Badge variant="outline" className="capitalize">
                          {tool.sponsoredPackage}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tool.sponsoredUntil ? (
                        <div>
                          <p className={`text-xs ${isExpiring ? "text-red-500 font-medium" : ""}`}>
                            {tool.sponsoredUntil.toLocaleDateString("id-ID")}
                          </p>
                          {daysLeft !== null && (
                            <p className={`text-xs ${isExpiring ? "text-red-500" : "text-muted-foreground"}`}>
                              {daysLeft > 0 ? `${daysLeft} hari lagi` : "Expired"}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unlimited</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-xs text-muted-foreground truncate">{tool.sponsoredNote ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{tool.viewCount}</td>
                    <td className="px-4 py-3 text-right font-mono">{tool._count.clicks}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/tools/${tool.id}/edit`}
                          className="inline-flex h-7 items-center rounded-md border px-2 text-xs"
                        >
                          Edit
                        </Link>
                        <form action={toggleSponsoredAction}>
                          <input type="hidden" name="id" value={tool.id} />
                          <Button type="submit" size="sm" variant="outline" className="h-7 text-xs text-red-500">
                            Remove
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

      {/* Quick-Add: Top Unsponsored Tools */}
      <div className="rounded-xl border">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">🚀 Quick Add — Top Unsponsored Tools</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Sorted by views. One-click to add as sponsored.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Tool</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-4 py-3 text-left">Affiliate</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {availableTools.map((tool) => (
                <tr key={tool.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">/{tool.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tool.category}</td>
                  <td className="px-4 py-3 text-right font-mono">{tool.viewCount}</td>
                  <td className="px-4 py-3 text-right font-mono">{tool.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    {tool.affiliateLink ? (
                      <span className="text-green-500 text-xs">✓</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateSponsoredDetailsAction} className="flex gap-2 items-center">
                      <input type="hidden" name="id" value={tool.id} />
                      <select name="sponsoredPackage" className="h-7 rounded-md border bg-background px-2 text-xs">
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                      <input
                        type="date"
                        name="sponsoredUntil"
                        className="h-7 rounded-md border bg-background px-2 text-xs"
                      />
                      <Button type="submit" size="sm" className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white">
                        Sponsor
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail */}
      {recentActivity.length > 0 && (
        <div className="rounded-xl border">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">📋 Recent Sponsored Activity</h2>
          </div>
          <div className="divide-y">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <div>
                  <span className="font-medium">{log.actorEmail ?? log.actorId}</span>
                  <span className="text-muted-foreground ml-2">{log.action}</span>
                  {log.metadata && typeof log.metadata === "object" && (
                    <span className="text-muted-foreground ml-1">
                      {(log.metadata as Record<string, unknown>).name
                        ? `— ${String((log.metadata as Record<string, unknown>).name)}`
                        : ""}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {log.createdAt.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

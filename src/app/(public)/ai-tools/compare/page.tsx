import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function CompareToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>
}) {
  const { slugs } = await searchParams
  const selected = (slugs ?? "").split(",").filter(Boolean).slice(0, 3)

  const tools = await prisma.aITool.findMany({
    where: { slug: { in: selected } },
    orderBy: { rating: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Compare AI Tools</h1>
      {tools.length < 2 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">Pilih minimal 2 tools untuk compare. <Link href="/ai-tools" className="text-primary underline">Kembali ke directory</Link></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Metric</th>
                {tools.map((tool) => <th key={tool.id} className="px-4 py-3 text-left">{tool.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t"><td className="px-4 py-3 font-medium">Category</td>{tools.map((tool) => <td key={tool.id} className="px-4 py-3">{tool.category}</td>)}</tr>
              <tr className="border-t"><td className="px-4 py-3 font-medium">Pricing</td>{tools.map((tool) => <td key={tool.id} className="px-4 py-3">{tool.pricing}</td>)}</tr>
              <tr className="border-t"><td className="px-4 py-3 font-medium">Rating</td>{tools.map((tool) => <td key={tool.id} className="px-4 py-3">{tool.rating}</td>)}</tr>
              <tr className="border-t"><td className="px-4 py-3 font-medium">Featured</td>{tools.map((tool) => <td key={tool.id} className="px-4 py-3">{tool.featured ? "Yes" : "No"}</td>)}</tr>
              <tr className="border-t"><td className="px-4 py-3 font-medium">Website</td>{tools.map((tool) => <td key={tool.id} className="px-4 py-3">{tool.affiliateLink ? <a href={`/api/tools/out?slug=${tool.slug}`} className="text-primary underline">Visit</a> : "-"}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

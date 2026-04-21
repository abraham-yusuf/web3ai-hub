import { Badge } from "@/components/ui/badge"
import { components } from "@/components/mdx"
import { prisma } from "@/lib/prisma"
import { Separator } from "@/components/ui/separator"
import { Disc as Discord, Globe, X } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import { notFound } from "next/navigation"
import Link from "next/link"
import { StepTracker } from "./step-tracker"
import { RequirementsChecklist } from "@/components/airdrop/requirements-checklist"
import { ReportIssueForm } from "@/components/airdrop/report-issue-form"

export const dynamic = "force-dynamic"

interface AirdropLinkMap {
  website?: string
  twitter?: string
  discord?: string
}

interface AirdropStep {
  title: string
  description?: string
  isOptional?: boolean
}

export async function generateStaticParams() {
  return []
}

export default async function AirdropDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const airdrop = await prisma.airdrop.findUnique({
    where: { slug },
  })

  if (!airdrop) {
    notFound()
  }

  const related = await prisma.airdrop.findMany({
    where: {
      slug: { not: airdrop.slug },
      OR: [{ network: airdrop.network }, { difficulty: airdrop.difficulty }],
    },
    take: 3,
    orderBy: { updatedAt: "desc" },
    select: { name: true, slug: true, network: true, status: true },
  })

  const socialLinks = (airdrop.links ?? {}) as AirdropLinkMap
  const steps = ((airdrop.steps ?? []) as unknown) as AirdropStep[]
  const statusVariant = airdrop.status === "ACTIVE" ? "default" : "secondary"

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-8">
      <div className="flex flex-col items-start gap-8 md:flex-row">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-muted text-4xl font-bold">
          {airdrop.name[0]}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{airdrop.network}</Badge>
            <Badge variant={statusVariant}>{airdrop.status}</Badge>
            <Badge variant="outline">Difficulty: {airdrop.difficulty}</Badge>
          </div>
          <h1 className="text-4xl font-bold">{airdrop.name}</h1>
          <p className="text-xl font-semibold text-primary">Est. Reward: {airdrop.estimatedReward ?? "TBA"}</p>
          <div className="flex gap-4">
            {socialLinks.website && (
              <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Globe className="h-5 w-5" />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <X className="h-5 w-5" />
              </a>
            )}
            {socialLinks.discord && (
              <a href={socialLinks.discord} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Discord className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <MDXRemote source={airdrop.content} components={components} />
          </div>

          {steps.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Step-by-Step Guide</h2>
              <StepTracker airdropSlug={airdrop.slug} steps={steps} />
            </div>
          )}

          {related.length > 0 && (
            <div className="space-y-4 rounded-xl border p-6">
              <h3 className="font-bold">Related Airdrops</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((item) => (
                  <Link key={item.slug} href={`/airdrop/${item.slug}`} className="rounded-md border p-3 transition-colors hover:border-primary">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.network} · {item.status}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border p-6">
            <h3 className="font-bold">Requirements Checklist</h3>
            <RequirementsChecklist slug={airdrop.slug} requirements={airdrop.requirements} />
          </div>
          <ReportIssueForm slug={airdrop.slug} />
        </div>
      </div>
    </div>
  )
}

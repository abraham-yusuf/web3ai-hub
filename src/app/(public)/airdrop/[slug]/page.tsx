import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { components } from "@/components/mdx"
import { Badge } from "@/components/ui/badge"
import { StepTracker } from "./step-tracker"
import { Separator } from "@/components/ui/separator"
import { Globe, X, Disc as Discord } from "lucide-react"

export const dynamic = 'force-dynamic'

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
    where: { slug }
  })

  if (!airdrop) {
    notFound()
  }

  const socialLinks = airdrop.links as any || {}
  const steps = airdrop.steps as any[] || []

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center text-4xl font-bold shrink-0">
          {airdrop.name[0]}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{airdrop.network}</Badge>
            <Badge variant={airdrop.status === 'ACTIVE' ? 'success' : 'secondary' as any}>
              {airdrop.status}
            </Badge>
            <Badge variant="outline">Difficulty: {airdrop.difficulty}</Badge>
          </div>
          <h1 className="text-4xl font-bold">{airdrop.name}</h1>
          <p className="text-xl text-primary font-semibold">
            Est. Reward: {airdrop.estimatedReward || 'TBA'}
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <MDXRemote source={airdrop.content} components={components} />
          </div>

          {steps.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Step-by-Step Guide</h2>
              <StepTracker airdropSlug={airdrop.slug} steps={steps} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border p-6 space-y-4">
            <h3 className="font-bold">Requirements</h3>
            <ul className="space-y-2">
              {airdrop.requirements.map((req, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateAirdropAction } from "../../actions"

interface EditAirdropPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAirdropPage({ params }: EditAirdropPageProps) {
  const { id } = await params
  const airdrop = await prisma.airdrop.findUnique({ where: { id } })

  if (!airdrop) notFound()

  const links = (airdrop.links ?? {}) as { website?: string; twitter?: string; discord?: string }
  const steps = ((airdrop.steps ?? []) as Array<{ title?: string }>).map((step) => step.title).filter(Boolean).join("\n")

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Airdrop</h1>
      <form action={updateAirdropAction} className="space-y-4 rounded-lg border p-6">
        <input type="hidden" name="id" value={airdrop.id} />
        <input name="name" required defaultValue={airdrop.name} className="w-full rounded-md border bg-background px-3 py-2" />
        <input name="slug" defaultValue={airdrop.slug} className="w-full rounded-md border bg-background px-3 py-2" />
        <input name="network" defaultValue={airdrop.network} className="w-full rounded-md border bg-background px-3 py-2" />
        <div className="grid gap-3 md:grid-cols-3">
          <select name="status" defaultValue={airdrop.status} className="rounded-md border bg-background px-3 py-2"><option value="ACTIVE">ACTIVE</option><option value="UPCOMING">UPCOMING</option><option value="ENDED">ENDED</option></select>
          <select name="difficulty" defaultValue={airdrop.difficulty} className="rounded-md border bg-background px-3 py-2"><option value="EASY">EASY</option><option value="MEDIUM">MEDIUM</option><option value="HARD">HARD</option></select>
          <input name="estimatedReward" defaultValue={airdrop.estimatedReward ?? ""} className="rounded-md border bg-background px-3 py-2" />
        </div>
        <textarea name="requirements" defaultValue={airdrop.requirements.join("\n")} className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" />
        <textarea name="steps" defaultValue={steps} className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" />
        <textarea name="content" defaultValue={airdrop.content} className="min-h-[240px] w-full rounded-md border bg-background p-3 font-mono text-sm" />
        <div className="grid gap-3 md:grid-cols-3">
          <input name="website" defaultValue={links.website ?? ""} className="rounded-md border bg-background px-3 py-2" />
          <input name="twitter" defaultValue={links.twitter ?? ""} className="rounded-md border bg-background px-3 py-2" />
          <input name="discord" defaultValue={links.discord ?? ""} className="rounded-md border bg-background px-3 py-2" />
        </div>
        <button type="submit" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Update</button>
      </form>
    </div>
  )
}

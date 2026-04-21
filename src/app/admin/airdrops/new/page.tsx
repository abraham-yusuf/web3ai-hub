import { createAirdropAction } from "../actions"

export default function NewAirdropPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Tambah Airdrop</h1>
      <form action={createAirdropAction} className="space-y-4 rounded-lg border p-6">
        <input name="name" required placeholder="Nama project" className="w-full rounded-md border bg-background px-3 py-2" />
        <input name="slug" placeholder="slug-project" className="w-full rounded-md border bg-background px-3 py-2" />
        <input name="network" placeholder="Ethereum" className="w-full rounded-md border bg-background px-3 py-2" />
        <div className="grid gap-3 md:grid-cols-3">
          <select name="status" className="rounded-md border bg-background px-3 py-2"><option value="ACTIVE">ACTIVE</option><option value="UPCOMING">UPCOMING</option><option value="ENDED">ENDED</option></select>
          <select name="difficulty" className="rounded-md border bg-background px-3 py-2"><option value="EASY">EASY</option><option value="MEDIUM">MEDIUM</option><option value="HARD">HARD</option></select>
          <input name="estimatedReward" placeholder="$500 - $3000" className="rounded-md border bg-background px-3 py-2" />
        </div>
        <textarea name="requirements" placeholder="Satu requirement per baris" className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" />
        <textarea name="steps" placeholder="Satu langkah per baris" className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" />
        <textarea name="content" placeholder="# Airdrop Guide" className="min-h-[240px] w-full rounded-md border bg-background p-3 font-mono text-sm" />
        <div className="grid gap-3 md:grid-cols-3">
          <input name="website" placeholder="https://..." className="rounded-md border bg-background px-3 py-2" />
          <input name="twitter" placeholder="https://x.com/..." className="rounded-md border bg-background px-3 py-2" />
          <input name="discord" placeholder="https://discord.gg/..." className="rounded-md border bg-background px-3 py-2" />
        </div>
        <button type="submit" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Simpan</button>
      </form>
    </div>
  )
}

import Link from "next/link"

export const dynamic = "force-dynamic"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Kelola konten blog dan workflow AI writer dari satu tempat.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Link href="/admin/posts" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Post Manager</Link>
        <Link href="/admin/ai-writer" className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium">AI Writer</Link>
        <Link href="/admin/airdrops" className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium">Airdrops</Link>
        <Link href="/admin/settings" className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium">Settings</Link>
      </div>
    </div>
  )
}

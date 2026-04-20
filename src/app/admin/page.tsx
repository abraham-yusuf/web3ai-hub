import Link from "next/link"

export const dynamic = "force-dynamic"

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Kelola konten blog dari dashboard admin.</p>
      <Link href="/admin/posts" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Go to Post Manager</Link>
    </div>
  )
}

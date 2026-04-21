import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border px-6 py-16 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="text-muted-foreground">
        URL yang kamu akses tidak tersedia atau sudah dipindahkan.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Kembali ke Home
        </Link>
        <Link href="/search" className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium">
          Cari Konten
        </Link>
      </div>
    </div>
  )
}

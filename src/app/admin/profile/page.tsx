import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { changeAdminPasswordAction, updateAdminProfileAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminProfilePage() {
  const session = await auth()
  const isBootstrap = session?.user?.id === "bootstrap-admin"
  const user = session?.user?.id && !isBootstrap
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          username: true,
          email: true,
          image: true,
          bio: true,
          twitter: true,
          github: true,
          linkedin: true,
          telegram: true,
          role: true,
        },
      })
    : null

  const profile = user ?? {
    name: session?.user?.name ?? "Bootstrap Admin",
    username: session?.user?.username ?? "bootstrap-admin",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? "",
    bio: "",
    twitter: "",
    github: "",
    linkedin: "",
    telegram: "",
    role: session?.user?.role ?? "ADMIN",
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">Edit data profil admin/editor dan ganti password akun.</p>
      </div>

      {isBootstrap ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          Kamu sedang memakai bootstrap admin dari environment. Buat user admin di database untuk mengaktifkan edit profil dan ganti password permanen.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Data Profil</CardTitle>
            <CardDescription>Informasi ini digunakan di dashboard admin dan halaman author publik.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateAdminProfileAction} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Nama
                  <input name="name" defaultValue={profile.name ?? ""} disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Username
                  <input name="username" defaultValue={profile.username ?? ""} disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Email
                  <input name="email" type="email" required defaultValue={profile.email ?? ""} disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Avatar URL
                  <input name="image" type="url" defaultValue={profile.image ?? ""} disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
              </div>
              <label className="space-y-2 text-sm font-medium">
                Bio
                <textarea name="bio" defaultValue={profile.bio ?? ""} disabled={isBootstrap} className="min-h-28 w-full rounded-md border bg-background p-3 font-normal" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <input name="twitter" placeholder="Twitter / X" defaultValue={profile.twitter ?? ""} disabled={isBootstrap} className="rounded-md border bg-background px-3 py-2" />
                <input name="github" placeholder="GitHub" defaultValue={profile.github ?? ""} disabled={isBootstrap} className="rounded-md border bg-background px-3 py-2" />
                <input name="linkedin" placeholder="LinkedIn" defaultValue={profile.linkedin ?? ""} disabled={isBootstrap} className="rounded-md border bg-background px-3 py-2" />
                <input name="telegram" placeholder="Telegram" defaultValue={profile.telegram ?? ""} disabled={isBootstrap} className="rounded-md border bg-background px-3 py-2" />
              </div>
              <button type="submit" disabled={isBootstrap} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
                Simpan Profil
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Akun</CardTitle>
              <CardDescription>Status session admin saat ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Role</span><span className="font-medium">{profile.role}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Email</span><span className="font-medium">{profile.email || "-"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Username</span><span className="font-medium">{profile.username || "-"}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ganti Password</CardTitle>
              <CardDescription>Gunakan password kuat minimal 8 karakter.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={changeAdminPasswordAction} className="space-y-4">
                <input name="currentPassword" type="password" required placeholder="Password saat ini" disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2" />
                <input name="newPassword" type="password" required minLength={8} placeholder="Password baru" disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2" />
                <input name="confirmPassword" type="password" required minLength={8} placeholder="Konfirmasi password baru" disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2" />
                <button type="submit" disabled={isBootstrap} className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50">
                  Update Password
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

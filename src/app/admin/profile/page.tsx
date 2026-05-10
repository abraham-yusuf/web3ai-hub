import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ProfileClient from "./profile-client"

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

      <ProfileClient profile={profile} isBootstrap={isBootstrap} />
    </div>
  )
}

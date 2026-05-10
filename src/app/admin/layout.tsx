import { auth, signOut } from "@/auth"
import { AdminShell } from "@/components/admin/admin-shell"
import { prisma } from "@/lib/prisma"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  async function signOutAction() {
    "use server"
    await signOut({ redirectTo: "/" })
  }

  if (!session?.user) {
    return <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">{children}</main>
  }

  const databaseUser = session.user.id !== "bootstrap-admin"
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, role: true },
      })
    : null

  const shellUser = databaseUser ?? session.user

  return (
    <AdminShell user={shellUser} signOutAction={signOutAction}>
      {children}
    </AdminShell>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateAdminProfileAction, changeAdminPasswordAction } from "./actions"
import { useRef } from "react"

interface ProfileData {
  name: string | null
  username: string | null
  email: string | null
  image: string | null
  bio: string | null
  twitter: string | null
  github: string | null
  linkedin: string | null
  telegram: string | null
  role: string
}

export default function ProfileClient({ 
  profile, 
  isBootstrap 
}: { 
  profile: ProfileData
  isBootstrap: boolean 
}) {
  const profileFormRef = useRef<HTMLFormElement>(null)
  const passwordFormRef = useRef<HTMLFormElement>(null)

  async function handleUpdateProfile(formData: FormData) {
    const result = await updateAdminProfileAction(formData)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  async function handleChangePassword(formData: FormData) {
    const result = await changeAdminPasswordAction(formData)
    if (result.success) {
      toast.success(result.message)
      passwordFormRef.current?.reset()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Data Profil</CardTitle>
          <CardDescription>Informasi ini digunakan di dashboard admin dan halaman author publik.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={profileFormRef} action={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                Nama
                <input name="name" defaultValue={profile.name ?? ""} disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Username
                <input name="username" defaultValue={profile.username ?? ""} disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Email
                <input name="email" type="email" required defaultValue={profile.email ?? ""} disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Avatar URL
                <input name="image" type="url" defaultValue={profile.image ?? ""} disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </label>
            </div>
            <label className="space-y-2 text-sm font-medium">
              Bio
              <textarea name="bio" defaultValue={profile.bio ?? ""} disabled={isBootstrap} className="min-h-28 w-full rounded-md border bg-background p-3 font-normal focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <input name="twitter" placeholder="Twitter / X" defaultValue={profile.twitter ?? ""} disabled={isBootstrap} className="rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input name="github" placeholder="GitHub" defaultValue={profile.github ?? ""} disabled={isBootstrap} className="rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input name="linkedin" placeholder="LinkedIn" defaultValue={profile.linkedin ?? ""} disabled={isBootstrap} className="rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input name="telegram" placeholder="Telegram" defaultValue={profile.telegram ?? ""} disabled={isBootstrap} className="rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button type="submit" disabled={isBootstrap} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
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
            <form ref={passwordFormRef} action={handleChangePassword} className="space-y-4">
              <input name="currentPassword" type="password" required placeholder="Password saat ini" disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input name="newPassword" type="password" required minLength={8} placeholder="Password baru" disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input name="confirmPassword" type="password" required minLength={8} placeholder="Konfirmasi password baru" disabled={isBootstrap} className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button type="submit" disabled={isBootstrap} className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">
                Update Password
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

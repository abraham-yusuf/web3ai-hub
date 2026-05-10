"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"
import { hashPassword, verifyPassword } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

const profileSchema = z.object({
  name: z.string().trim().max(120).optional(),
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_-]+$/).optional().or(z.literal("")),
  email: z.string().trim().email(),
  image: z.string().trim().url().optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional(),
  twitter: z.string().trim().max(120).optional(),
  github: z.string().trim().max(120).optional(),
  linkedin: z.string().trim().max(120).optional(),
  telegram: z.string().trim().max(120).optional(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  })

async function requireDatabaseUser() {
  const session = await auth()

  if (!session?.user?.id || session.user.id === "bootstrap-admin") {
    throw new Error("Profil hanya bisa diubah oleh user admin/editor yang tersimpan di database.")
  }

  return session.user.id
}

function emptyToNull(value?: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export async function updateAdminProfileAction(formData: FormData) {
  const userId = await requireDatabaseUser()
  const parsed = profileSchema.parse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    image: formData.get("image"),
    bio: formData.get("bio"),
    twitter: formData.get("twitter"),
    github: formData.get("github"),
    linkedin: formData.get("linkedin"),
    telegram: formData.get("telegram"),
  })

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: emptyToNull(parsed.name),
      username: emptyToNull(parsed.username),
      email: parsed.email,
      image: emptyToNull(parsed.image),
      bio: emptyToNull(parsed.bio),
      twitter: emptyToNull(parsed.twitter),
      github: emptyToNull(parsed.github),
      linkedin: emptyToNull(parsed.linkedin),
      telegram: emptyToNull(parsed.telegram),
    },
  })

  revalidatePath("/admin/profile")
  revalidatePath("/admin")
}

export async function changeAdminPasswordAction(formData: FormData) {
  const userId = await requireDatabaseUser()
  const parsed = passwordSchema.parse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })

  if (!user?.password) {
    throw new Error("Password user belum tersedia.")
  }

  const currentPasswordMatches = user.password.startsWith("$2")
    ? await verifyPassword(parsed.currentPassword, user.password)
    : parsed.currentPassword === user.password

  if (!currentPasswordMatches) {
    throw new Error("Password saat ini tidak valid.")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(parsed.newPassword) },
  })

  revalidatePath("/admin/profile")
}

import type { Role } from "@prisma/client"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { verifyPassword, hashPassword } from "@/lib/auth-utils"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data

        // Bootstrap admin — env-based fallback for initial setup
        if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
          return {
            id: "bootstrap-admin",
            name: "Bootstrap Admin",
            email: env.ADMIN_EMAIL,
            role: "ADMIN" as Role,
            username: "bootstrap-admin",
          }
        }

        // DB-backed user authentication with hashed password
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, username: true, name: true, email: true, password: true, role: true },
        })

        if (!user?.password || !user.email) {
          return null
        }

        // Support both hashed ($2b$) and legacy plaintext passwords
        let isValid = false
        if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
          isValid = await verifyPassword(password, user.password)
        } else {
          // Legacy plaintext comparison — migrate on successful login
          isValid = user.password === password
          if (isValid) {
            const hashed = await hashPassword(password)
            await prisma.user.update({
              where: { id: user.id },
              data: { password: hashed },
            })
          }
        }

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    // NOTE: Admin route protection is handled by proxy.ts middleware.
    // The proxy checks the JWT token and redirects unauthenticated users.
    // This avoids double-redirect conflicts between proxy and authorized callback.
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role
      }
      if (user?.id) {
        token.id = user.id
      }
      if (user?.username !== undefined) {
        token.username = user.username
      }
      return token
    },
    session({ session, token }) {
      if (session.user && (token.role === "ADMIN" || token.role === "EDITOR" || token.role === "VIEWER")) {
        session.user.role = token.role
      }
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id
      }
      if (session.user && (typeof token.username === "string" || token.username === null)) {
        session.user.username = token.username
      }
      return session
    },
  },
})

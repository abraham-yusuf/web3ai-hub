import type { Role } from "@prisma/client"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const adminAreaRoles: Role[] = ["ADMIN", "EDITOR"]

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

        if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
          return {
            id: "bootstrap-admin",
            name: "Bootstrap Admin",
            email: env.ADMIN_EMAIL,
            role: "ADMIN" as Role,
          }
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, password: true, role: true },
        })

        if (!user?.password || user.password !== password || !user.email) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth: activeSession, request: { nextUrl } }) {
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isOnLogin = nextUrl.pathname === "/admin/login"

      if (!isOnAdmin || isOnLogin) {
        return true
      }

      if (!activeSession?.user?.role) {
        return false
      }

      return adminAreaRoles.includes(activeSession.user.role)
    },
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user && (token.role === "ADMIN" || token.role === "EDITOR" || token.role === "VIEWER")) {
        session.user.role = token.role
      }
      return session
    },
  },
})

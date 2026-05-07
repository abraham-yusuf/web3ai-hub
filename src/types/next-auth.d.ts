import type { DefaultSession } from "next-auth"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: Role
      username?: string | null
    }
  }

  interface User {
    role: Role
    username?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role
  }
}
